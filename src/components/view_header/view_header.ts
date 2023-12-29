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
import { ViewHeaderWidget } from "./view_header_widget";

export default class ViewHeader {
    protected readonly view: View;
    protected readonly leftWidgetContainerEl: HTMLElement;
    protected readonly centerWidgetContainerEl: HTMLElement;
    protected readonly rightWidgetContainerEl: HTMLElement;

    public constructor(view: View) {
        this.view = view;
        view.headerEl.addClass("notescape-view-header");

        this.leftWidgetContainerEl = view.headerEl.find(".view-header-nav-buttons");
        this.leftWidgetContainerEl.addClass("notescape-left-widget-container");

        this.centerWidgetContainerEl = view.headerEl.find(".view-header-title-container");
        this.centerWidgetContainerEl.addClass("notescape-center-widget-container");

        this.rightWidgetContainerEl = view.headerEl.find(".view-actions");
        this.rightWidgetContainerEl.addClass("notescape-right-widget-container");
    }

    public addWidget(widget: ViewHeaderWidget, position: "left" | "center" | "right") {
        switch (position) {
            case "left":
                this.leftWidgetContainerEl.append(widget.create());
                break;
            case "center":
                this.centerWidgetContainerEl.append(widget.create());
                break;
            case "right":
                this.rightWidgetContainerEl.prepend(widget.create());
                break;
        }
    }
}
