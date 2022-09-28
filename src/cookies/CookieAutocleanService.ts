// -*- indent-tabs-mode: nil; tab-width: 2; -*-
// vim: set ts=2 sw=2 et ai :

/*
  Container Tab Groups
  Copyright (C) 2022 Menhera.org

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { StorageItem, StorageArea } from "../frameworks/storage";
import { Uint32 } from "../frameworks/types";

export class CookieAutocleanService {
  private static readonly STORAGE_KEY = 'cookies.autoclean.enabledUserContexts';
  private static readonly INSTANCE = new CookieAutocleanService();

  public static getInstance(): CookieAutocleanService {
    return CookieAutocleanService.INSTANCE;
  }

  private readonly _storageItem = new StorageItem<Uint32.Uint32[]>(CookieAutocleanService.STORAGE_KEY, [], StorageArea.LOCAL);

  private constructor() {
    // Do nothing
  }

  public async getAutocleanEnabledUserContexts(): Promise<Uint32.Uint32[]> {
    return await this._storageItem.getValue();
  }

  public async enableAutocleanForUserContext(userContextId: Uint32.Uint32): Promise<void> {
    const userContexts = await this.getAutocleanEnabledUserContexts();
    if (!userContexts.includes(userContextId)) {
      userContexts.push(userContextId);
      await this._storageItem.setValue(userContexts);
    }
  }

  public async disableAutocleanForUserContext(userContextId: Uint32.Uint32): Promise<void> {
    const userContexts = await this.getAutocleanEnabledUserContexts();
    const index = userContexts.indexOf(userContextId);
    if (index >= 0) {
      userContexts.splice(index, 1);
      await this._storageItem.setValue(userContexts);
    }
  }
}