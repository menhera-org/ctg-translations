/* -*- indent-tabs-mode: nil; tab-width: 2; -*- */
/* vim: set ts=2 sw=2 et ai : */
/**
  Container Tab Groups
  Copyright (C) 2023 Menhera.org

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
  @license
**/

import { StorageItem } from "weeg-storage";

import { ServiceRegistry } from "../ServiceRegistry";
import { ActiveContainerBatchOperation } from "./ActiveContainerBatchOperation";

export type ActiveContainerStorageType = {
  [windowId: number]: string; // cookieStoreId
};

export class ActiveContainerService {
  private static readonly STORAGE_KEY = "activeContainerByWindow";

  private static readonly INSTANCE = new ActiveContainerService();

  public static getInstance(): ActiveContainerService {
    return ActiveContainerService.INSTANCE;
  }

  private readonly _storage = new StorageItem<ActiveContainerStorageType>(ActiveContainerService.STORAGE_KEY, {}, StorageItem.AREA_LOCAL);

  private constructor() {
    // nothing.
  }

  private async getValue(): Promise<ActiveContainerStorageType> {
    return this._storage.getValue();
  }

  private async setValue(value: ActiveContainerStorageType): Promise<void> {
    return this._storage.setValue(value);
  }

  public async getWindowIds(): Promise<number[]> {
    const value = await this.getValue();
    return Object.keys(value).map((key) => parseInt(key, 10));
  }

  public async removeWindow(windowId: number): Promise<void> {
    const value = await this.getValue();
    delete value[windowId];
    await this.setValue(value);
  }

  public async setActiveContainer(windowId: number, cookieStoreId: string): Promise<void> {
    const value = await this.getValue();
    if (value[windowId] != cookieStoreId) {
      console.debug('ActiveContainerService.setActiveContainer: windowId =', windowId, 'cookieStoreId =', cookieStoreId);
    }
    value[windowId] = cookieStoreId;
    await this.setValue(value);
  }

  public async getActiveContainer(windowId: number): Promise<string | undefined> {
    const value = await this.getValue();
    return value[windowId];
  }

  public async beginBatchOperation(): Promise<ActiveContainerBatchOperation> {
    const value = await this.getValue();
    return new ActiveContainerBatchOperation(value);
  }

  public async commitBatchOperation(operation: ActiveContainerBatchOperation): Promise<void> {
    await this.setValue(operation.getValue());
  }
}

ServiceRegistry.getInstance().registerService('ActiveContainerService', ActiveContainerService.getInstance());