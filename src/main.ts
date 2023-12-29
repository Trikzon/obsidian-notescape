/*
 * This file is part of Notescape.
 * A copy of this program can be found at https://github.com/Trikzon/obsidian-notescape.
 * Copyright (C) 2023 Dion Tryban
 *
 * Notescape is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * Notescape is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Notescape. If not, see <https://www.gnu.org/licenses/>.
 */

import { App, ItemView, Plugin, View, WorkspaceLeaf } from "obsidian";
import { NotescapeSettings } from "./settings/settings";
import { NotescapeSettingTab } from "./settings/settings_tab";
import { WEB_VIEW_TYPE, WebView } from "./views/web_view";
import { WebViewHeader } from "./components/view_header/web_view_header";
import { around } from "monkey-around";
import { session } from "@electron/remote";
import { FiltersEngine, Request } from "@cliqz/adblocker";

export default class NotescapePlugin extends Plugin {
    public static unloaded: boolean = false;
    public settings: NotescapeSettings;

    public static get(app: App): NotescapePlugin {
        return app.plugins.getPlugin("notescape");
    }

    public override async onload(): Promise<void> {
        this.settings = await NotescapeSettings.load(this);
        this.addSettingTab(new NotescapeSettingTab(this.app, this));

        this.registerView(WEB_VIEW_TYPE, (leaf) => new WebView(leaf, "Notescape"));

        function addWidgetBarToEmptyView(view: View) {
            if (view && view.hasOwnProperty("emptyStateEl")) {
                if (!view.headerEl.find(".notescape-view-header")) {
                    new WebViewHeader(view);
                }
            }
        }
        this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
            addWidgetBarToEmptyView(leaf.view);
        });
        this.registerEvent(this.app.workspace.on("layout-change", () => {
            const view = this.app.workspace.getActiveViewOfType(ItemView);
            if (view) {
                addWidgetBarToEmptyView(view);
            }
        }));

        // TODO: Turn this into a full adblocking plugin.
        const engine = await FiltersEngine.fromPrebuiltFull(fetch);
        session.fromPartition("persist:notescape-web-view").webRequest.onBeforeRequest((details, callback) => {
            if (NotescapePlugin.unloaded) {
                return;
            }

            let request: Request;
            if (details.webContentsId) {
                request = Request.fromRawDetails({
                    _originalRequestDetails: details,
                    requestId: details.id.toString(),
                    sourceUrl: details.referrer,
                    tabId: details.webContentsId,
                    type: details.resourceType || "other",
                    url: details.url
                });
            } else {
                request = Request.fromRawDetails({
                    _originalRequestDetails: details,
                    requestId: details.id.toString(),
                    sourceUrl: details.referrer,
                    type: details.resourceType || "other",
                    url: details.url
                });
            }

            if (request.isMainFrame()) {
                callback({});
                return;
            }

            const { redirect, match } = engine.match(request);

            if (redirect) {
                callback({ redirectURL: redirect.dataUrl });
            } else if (match) {
                callback({ cancel: true });
            } else {
                callback({});
            }
        });
        this.register(() => {
            session.fromPartition("persist:notescape-web-view").webRequest.onBeforeRequest(null);
            console.log("Unregistered callback.");
        });
        console.log("Initializing");

        const app = this.app;
        //@ts-ignore
        this.register(around(window, {
			open(next) {
				return (url?: string | URL, target?: string, features?: string): WindowProxy | null => {
                    if (!url) {
                        return next(url, target, features);
                    }

                    const urlUrl: URL = typeof url === "string" ? new URL(url) : url;

                    // Allows Obsidian to open a popup window if url is "about:blank" and features is not null.
                    // TODO: Find out if there's a better way to detect a popup window.
                    if (urlUrl.toString() === "about:blank" && features) {
                        return next(url, target, features);
                    }

                    // Don't open Notescape web view if the url is specifically targeting an external browser.
                    if (target === "_blank" || features === "external") {
                        return next(url, target, features);
                    }

                    // Only open a Notescape web view if the url is a website.
                    if (urlUrl.protocol !== "http:" && urlUrl.protocol !== "https:") {
                        return next(url, target, features);
                    }

                    WebView.spawn(app, true, { url: urlUrl.toString() });

                    return null;
                }
            }
        }));
    }

    public override onunload(): void {
        this.app.workspace.detachLeavesOfType(WEB_VIEW_TYPE);

        // Cleanup custom view header on empty views.
        this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
            if (leaf.view.hasOwnProperty("emptyStateEl")) {
                leaf.detach();
            }
        });

        NotescapePlugin.unloaded = true;
        console.log("Destructing");
    }
}
