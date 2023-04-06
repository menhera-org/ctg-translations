// -*- indent-tabs-mode: nil; tab-width: 2; -*-
// vim: set ts=2 sw=2 et ai :

/*
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
*/

import { CompatTab } from "weeg-tabs";

import { TabGroupDirectory, StorageType, SupergroupType } from "./TabGroupDirectory";
import { IndexTab } from "../modules/IndexTab";
import { TabGroupAttributes } from "./TabGroupAttributes";

export class TabGroupDirectorySnapshot {
  private readonly _value: StorageType;

  public constructor(value: StorageType) {
    this._value = value;
  }

  public get value(): StorageType {
    return structuredClone(this._value);
  }

  public getSupergroup(tabGroupId: string): SupergroupType | undefined {
    const value = this.value;
    return value[tabGroupId];
  }

  public getParentTabGroupId(tabGroupId: string): string | undefined {
    const value = this.value;
    for (const supergroupId in value) {
      const supergroup = value[supergroupId] as SupergroupType;
      if (supergroup.members.includes(tabGroupId)) {
        return supergroupId;
      }
    }
    return undefined;
  }

  public getContainerOrder(tabGroupId = TabGroupDirectory.getRootSupergroupId()): string[] {
    const value = this.value;
    const supergroup = value[tabGroupId] as SupergroupType;
    if (!supergroup) return [];
    const tabGroupIds: string[] = [];
    for (const memberTabGroupId of supergroup.members) {
      const attributes = new TabGroupAttributes(memberTabGroupId);
      if (attributes.tabGroupType == 'cookieStore') {
        tabGroupIds.push(memberTabGroupId);
      } else {
        tabGroupIds.push(... this.getContainerOrder(memberTabGroupId));
      }
    }
    return tabGroupIds;
  }

  public sortTabs(tabs: Iterable<CompatTab>): CompatTab[] {
    const tabGroupIds = this.getContainerOrder();
    const tabArray = [... tabs];
    tabArray.sort((a, b) => {
      const aIndex = tabGroupIds.indexOf(a.cookieStore.id);
      const bIndex = tabGroupIds.indexOf(b.cookieStore.id);
      if (aIndex != bIndex) {
        if (aIndex == -1) return 1;
        if (bIndex == -1) return -1;
      } else {
        if (IndexTab.isIndexTabUrl(a.url)) {
          return -1;
        }
        if (IndexTab.isIndexTabUrl(b.url)) {
          return 1;
        }
      }
      return aIndex - bIndex;
    });
    return tabArray;
  }

  public cookieStoreIdSortingCallback(a: string, b: string): number {
    const tabGroupIds = this.getContainerOrder();
    const aIndex = tabGroupIds.indexOf(a);
    const bIndex = tabGroupIds.indexOf(b);
    if (aIndex != bIndex) {
      if (aIndex == -1) return 1;
      if (bIndex == -1) return -1;
    }
    return aIndex - bIndex;
  }
}
