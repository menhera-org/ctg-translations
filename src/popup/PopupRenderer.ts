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

import browser from 'webextension-polyfill';
import { Tab, WindowService } from "../frameworks/tabs";
import { FirstPartyTabMap, UserContext, WindowUserContextList } from "../frameworks/tabGroups";
import { MenulistTabElement } from "../components/menulist-tab";
import { MenulistContainerElement } from "../components/menulist-container";
import * as containers from '../modules/containers.js';
import { OriginAttributes } from "../frameworks/tabGroups";
import { TabGroup } from "../frameworks/tabGroups";
import { UserContextVisibilityService } from '../userContexts/UserContextVisibilityService';
import { IndexTab } from "../modules/IndexTab";
import { PopupCurrentWindowRenderer } from "./PopupCurrentWindowRenderer";
import { PopupWindowListRenderer } from "./PopupWindowListRenderer";
import { PopupSiteListRenderer } from "./PopupSiteListRenderer";
import { Uint32 } from "../frameworks/types";
import { UserContextService } from '../userContexts/UserContextService';

enum ContainerTabsState {
  NO_TABS,
  HIDDEN_TABS,
  VISIBLE_TABS,
}

// This needs some refactoring.
export class PopupRenderer {
  private _userContextVisibilityService = UserContextVisibilityService.getInstance();
  private _userContextService = UserContextService.getInstance();
  public readonly currentWindowRenderer = new PopupCurrentWindowRenderer(this);
  public readonly windowListRenderer = new PopupWindowListRenderer(this);
  public readonly siteListRenderer = new PopupSiteListRenderer(this);

  public renderTab(tab: Tab, userContext: UserContext = UserContext.DEFAULT): MenulistTabElement {
    const element = new MenulistTabElement(tab, userContext);
    element.onTabClicked.addListener(() => {
      tab.focus().then(() => {
        window.close();
      });
    });
    element.onClose.addListener(() => {
      tab.close().then(() => {
        this.render();
      });
    });
    return element;
  }

  private renderPartialContainerElement(userContext: UserContext = UserContext.DEFAULT): MenulistContainerElement {
    userContext = this._userContextService.fillDefaultValues(userContext);
    const element = new MenulistContainerElement(userContext);
    element.containerVisibilityToggleButton.disabled = true;
    return element;
  }

  private defineContainerCloseListenerForWindow(element: MenulistContainerElement, windowId: number, userContext: UserContext): void {
    element.onContainerClose.addListener(() => {
      containers.closeAllTabsOnWindow(userContext.id, windowId).catch((e) => {
        console.error(e);
      });
    });
  }

  public renderContainerForWindow(windowId: number, userContext: UserContext = UserContext.DEFAULT): MenulistContainerElement {
    const element = this.renderPartialContainerElement(userContext);
    this.defineContainerCloseListenerForWindow(element, windowId, userContext);
    return element;
  }

  public renderContainerForFirstPartyDomain(domain: string, userContext: UserContext = UserContext.DEFAULT, isPrivateBrowsing = false): MenulistContainerElement {
    const element = this.renderPartialContainerElement(userContext);
    element.onContainerClose.addListener(() => {
      const originAttributes = new OriginAttributes(domain, userContext.id, (isPrivateBrowsing ? 1 : 0) as Uint32.Uint32);
      TabGroup.createTabGroup(originAttributes).then((tabGroup) => {
        return tabGroup.tabList.closeTabs();
      }).catch((e) => {
        console.error(e);
      });
    });
    return element;
  }

  private renderContainer(windowId: number, userContext: UserContext): MenulistContainerElement {
    userContext = this._userContextService.fillDefaultValues(userContext);
    const element = new MenulistContainerElement(userContext);
    this.defineContainerCloseListenerForWindow(element, windowId, userContext);
    element.onContainerHide.addListener(async () => {
      await this._userContextVisibilityService.hideContainerOnWindow(windowId, userContext.id);
      await this.render();
    });
    element.onContainerUnhide.addListener(async () => {
      await this._userContextVisibilityService.showContainerOnWindow(windowId, userContext.id);
      await this.render();
    });
    element.onContainerClick.addListener(async () => {
      await containers.openNewTabInContainer(userContext.id, windowId);
      window.close();
    });
    element.onContainerEdit.addListener(async () => {
      // render container edit pane.
    });
    element.onContainerDelete.addListener(async () => {
      // confirmAsync
    });
    return element;
  }

  public renderContainerWithTabs(windowId: number, userContext: UserContext, tabs: Tab[]): MenulistContainerElement {
    const element = this.renderContainer(windowId, userContext);
    let tabCount = 0;
    let state = ContainerTabsState.NO_TABS;
    for (const tab of tabs) {
      if (IndexTab.isIndexTabUrl(tab.url)) {
        continue;
      }
      tabCount++;
      if (tab.hidden) {
        state = ContainerTabsState.HIDDEN_TABS;
        continue;
      }

      element.appendChild(this.renderTab(tab, userContext));
      state = ContainerTabsState.VISIBLE_TABS;
    }
    if (state === ContainerTabsState.HIDDEN_TABS) {
      element.containerHidden = true;
    }
    element.tabCount = tabCount;
    return element;
  }

  public async render() {
    // unimplemented.
    const browserWindow = await browser.windows.get(browser.windows.WINDOW_ID_CURRENT);
    const windowId = browserWindow.id;
    if (null == windowId) {
      return;
    }
    const currentWindowMenuList = document.querySelector<HTMLElement>('#menuList');
    const windowListMenuList = document.querySelector<HTMLElement>('#windowMenuList');
    const sitesMenuList = document.querySelector<HTMLElement>('#sites-pane-top');
    if (!currentWindowMenuList || !windowListMenuList || !sitesMenuList) {
      console.warn('Elements not found');
      return;
    }
    const windowService = WindowService.getInstance();
    const [windowUserContextList, activeTabsByWindow, firstPartyTabMap] = await Promise.all([
      WindowUserContextList.create(windowId),
      windowService.getActiveTabsByWindow(),
      FirstPartyTabMap.create(browserWindow.incognito),
    ]);
    this.currentWindowRenderer.renderCurrentWindowView(windowUserContextList, currentWindowMenuList);
    this.windowListRenderer.renderWindowListView(activeTabsByWindow, windowListMenuList);
    this.siteListRenderer.renderSiteListView(firstPartyTabMap, sitesMenuList);
  }
}
