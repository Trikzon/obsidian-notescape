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

import NotescapePlugin from "src/main";

const DEFAULT_SETTINGS: Partial<NotescapeSettings> = {
    searchEngineQueryUrl: "https://www.duckduckgo.com/?q=",
};

export class NotescapeSettings {
    public searchEngineQueryUrl: string;

    private constructor() { }

    public static async load(plugin: NotescapePlugin): Promise<NotescapeSettings> {
        const settings = Object.assign(
            new NotescapeSettings(),
            DEFAULT_SETTINGS,
            await plugin.loadData()
        );
        await settings.save(plugin);

        return settings;
    }

    public async save(plugin: NotescapePlugin): Promise<void> {
        await plugin.saveData(this);
    }
}
