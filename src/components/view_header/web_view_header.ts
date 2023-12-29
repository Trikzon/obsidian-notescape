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

import { View } from "obsidian";
import ViewHeader from "./view_header";
import { ViewHeaderButtonWidget, ViewHeaderWidget } from "./view_header_widget";
import { NavigableView, isNavigable as isNavigableView } from "src/views/navigable_view";
import { WebView } from "src/views/web_view";
import NotescapePlugin from "src/main";

export class WebViewHeader extends ViewHeader {
    public constructor(view: View) {
        super(view);
        view.headerEl.addClass("notescape-web-view-header");

        this.centerWidgetContainerEl.empty();

        this.addWidget(new SearchWidget(this.view, this), "center");

        this.addWidget(new NotescapeSettingsWidget(this.view, this), "right");
        this.addWidget(new ExternalBrowserWidget(this.view, this), "right");
    }
}

export class SearchWidget extends ViewHeaderWidget {
    private inputEl: HTMLInputElement;

    public create(): HTMLElement {
        this.inputEl = document.createElement("input");
        this.inputEl.addClass("netscape-view-header-search-widget");
        this.inputEl.type = "text";
        // TODO: Put the search engine's name in the placeholder.
        this.inputEl.placeholder = "Search the web or enter address";

        if (isNavigableView(this.view)) {
            const navigable: NavigableView = this.view;

            this.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
                if (this.inputEl.value !== "" && event.key === "Enter") {
                    navigable.navigate(this.sanitizeSearch(this.inputEl.value), true, true);
                }
            }, false);

            navigable.on("navigated", (url: string) => {
                this.inputEl.value = url;
            });
        } else {
            this.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
                if (this.inputEl.value !== "" && event.key === "Enter") {
                    WebView.spawn(this.view.app, event.metaKey, { url: this.sanitizeSearch(this.inputEl.value) });
                }
            }, false);
        }

        return this.inputEl;
    }

    private sanitizeSearch(search: string): string {
        let url: URL;
        try {
            url = new URL(search);
        } catch {
            url = new URL("https://" + search);
        }

        // If the search is [non-whitespace characters] + "." + [non-whitespace characters], treat it as a URL.
        // Otherwise, treat it as a search query for a search engine.
        const matches = url.host.match(/\S+\.\S+/g);
        if (!(matches && matches[0] === url.host)) {
            url = new URL(NotescapePlugin.get(this.view.app).settings.searchEngineQueryUrl + search)
        }

        return url.href;
    }
}

export class ExternalBrowserWidget extends ViewHeaderButtonWidget {
    public constructor(view: View, viewHeader: ViewHeader) {
        super(view, viewHeader, "external-link", "Open in external browser");
    }

    protected override onClick(event: MouseEvent): void {
        if (isNavigableView(this.view)) {
            window.open(this.view.getUrl(), "_blank");
        }
    }
}

export class NotescapeSettingsWidget extends ViewHeaderButtonWidget {
    public constructor(view: View, viewHeader: ViewHeader) {
        super(view, viewHeader, "settings", "Open Settings");
    }

    protected override onClick(event: MouseEvent): void {
        this.view.app.setting.open();
        this.view.app.setting.openTabById("notescape")
    }
}
