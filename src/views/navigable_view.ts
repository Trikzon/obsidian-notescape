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

export type NavigatedCallback = (url: string) => void;

export interface NavigableView {
    navigate(url: string, addToHistory: boolean, updateWebview: boolean): void;
    on(name: "navigated", callback: NavigatedCallback): void;
    getUrl(): string;
}

export function isNavigable(instance: any): instance is NavigableView {
    try {
        return "navigate" in instance && typeof instance.navigate === "function"
            && "on" in instance && typeof instance.on === "function"
            && "getUrl" in instance && typeof instance.getUrl === "function";
    } catch { // If instance is a primitive type, it will cause an error.
        return false;
    }
}
