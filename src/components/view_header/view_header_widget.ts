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

import { View, setIcon } from "obsidian";
import ViewHeader from "./view_header";

export abstract class ViewHeaderWidget {
    protected readonly view: View;
    protected readonly viewHeader: ViewHeader;

    public constructor(view: View, viewHeader: ViewHeader) {
        this.view = view;
        this.viewHeader = viewHeader;
    }

    public abstract create(): HTMLElement;
}

export abstract class ViewHeaderButtonWidget extends ViewHeaderWidget {
    protected readonly icon: string;
    protected readonly label: string;
    protected buttonEl: HTMLAnchorElement;

    public constructor(view: View, viewHeader: ViewHeader, icon: string, label: string) {
        super(view, viewHeader);
        this.icon = icon;
        this.label = label;
    }

    public override create(): HTMLElement {
        this.buttonEl = document.createElement("a");
        this.buttonEl.addClass("clickable-icon");
        this.buttonEl.addClass("view-action");
        this.buttonEl.addClass("notescape-view-header-button-widget");
        this.buttonEl.ariaLabel = this.label;
        setIcon(this.buttonEl, this.icon);

        this.buttonEl.addEventListener("click", this.onClick.bind(this));

        return this.buttonEl;
    }

    protected abstract onClick(event: MouseEvent): void;
}
