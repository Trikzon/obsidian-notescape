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

import { DidNavigateInPageEvent, Event, HandlerDetails, Input, PageFaviconUpdatedEvent, PageTitleUpdatedEvent, WebviewTag, WillNavigateEvent } from "electron";
import RenamableItemView from "./renamable_item_view";
import { App, ViewStateResult } from "obsidian";
import { NavigableView, NavigatedCallback } from "./navigable_view";
import { WebViewHeader } from "src/components/view_header/web_view_header";
import { session, webContents } from "@electron/remote";

export const WEB_VIEW_TYPE = "notescape-web-view";

export interface WebViewState {
    url: string;
}

export class WebView extends RenamableItemView implements NavigableView {
    private readonly navigatedCallbacks: Array<NavigatedCallback> = new Array<NavigatedCallback>();

    public favicon: HTMLImageElement;
    public webviewEl: WebviewTag;

    public static async spawn(app: App, newLeaf: boolean, state: WebViewState) {
        await app.workspace.getLeaf(newLeaf).setViewState({ type: WEB_VIEW_TYPE, active: true, state });
    }

    protected override async onOpen(): Promise<void> {
        this.contentEl.addClass("notescape-view-content");
        this.navigation = true;

        new WebViewHeader(this);

        this.favicon = document.createElement("img");
        this.favicon.width = 16;
        this.favicon.height = 16;

        this.webviewEl = document.createElement("webview");
        this.webviewEl.addClass("notescape-webview");
        this.webviewEl.partition = "persist:notescape-web-view";
        this.contentEl.appendChild(this.webviewEl);

        this.webviewEl.addEventListener("focus", (_: FocusEvent) => {
            this.app.workspace.setActiveLeaf(this.leaf);
        });
        this.webviewEl.addEventListener("page-title-updated", (event: PageTitleUpdatedEvent) => {
            this.rename(event.title);
        });
        this.webviewEl.addEventListener("will-navigate", (event: WillNavigateEvent) => {
            this.navigate(event.url, true, false);
        });
        this.webviewEl.addEventListener("did-navigate-in-page", (event: DidNavigateInPageEvent) => {
            this.navigate(event.url, true, false);
        });
        this.webviewEl.addEventListener("page-favicon-updated", (event: PageFaviconUpdatedEvent) => {
            if (event.favicons[0] !== undefined) {
                this.favicon.src = event.favicons[0];
                this.leaf.tabHeaderInnerIconEl.empty();
                this.leaf.tabHeaderInnerIconEl.appendChild(this.favicon);
            }
        });
        this.webviewEl.addEventListener("dom-ready", (_: Event) => {
            const contents = webContents.fromId(this.webviewEl.getWebContentsId())

            contents?.setWindowOpenHandler((details: HandlerDetails) => {
                WebView.spawn(this.app, true, { url: details.url });

                return { action: "allow" };
            });

            contents?.on("before-input-event", (event: Event, input: Input) => {
                if (input.type !== "keyDown") {
                    return;
                }

                activeDocument.body.dispatchEvent(new KeyboardEvent("keydown", {
                    code: input.code,
                    key: input.key,
                    shiftKey: input.shift,
                    altKey: input.alt,
                    ctrlKey: input.control,
                    metaKey: input.meta,
                    repeat: input.isAutoRepeat
                }));
            });

            contents?.on("destroyed", () => { });
        });
    }

    public override getState(): WebViewState {
        return { url: this.webviewEl.src };
    }

    public override async setState(state: WebViewState, result: ViewStateResult): Promise<void> {
        this.navigate(state.url, false, true);
    }

    public override getViewType(): string {
        return WEB_VIEW_TYPE;
    }

    public override getIcon(): string {
        return "compass";
    }

    // override from NavigableView
    public navigate(url: string, addToHistory: boolean, updateWebview: boolean): void {
        if (addToHistory) {
            // TODO: History
        }
        if (updateWebview) {
            this.webviewEl.src = url;
        }
        for (const callback of this.navigatedCallbacks) {
            callback(url);
        }
    }

    // override from NavigableView
    public on(name: "navigated", callback: NavigatedCallback): void {
        this.navigatedCallbacks.push(callback);
    }

    // override from NavigableView
    public getUrl(): string {
        return this.webviewEl.src;        
    }
}
