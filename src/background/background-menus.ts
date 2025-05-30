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

import browser from 'webextension-polyfill';
import { CookieStore } from 'weeg-containers';
import { CompatTab } from 'weeg-tabs';

import { MenuItem } from '../lib/menus/MenuItem';
import { PopupTabContextMenuItem } from '../lib/menus/PopupTabContextMenuItem';
import { ExtensionPageService } from '../lib/ExtensionPageService';

import { ContainerVisibilityService } from '../lib/tabGroups/ContainerVisibilityService';
import { TemporaryContainerService } from '../lib/tabGroups/TemporaryContainerService';
import * as containers from '../legacy-lib/modules/containers';

const MENU_ID_TAB_HIDE_CONTAINER = 'tab-hide-container';
const MENU_ID_TAB_FOCUS_CONTAINER = 'tab-focus-container';
const MENU_ID_TAB_NEW_TEMPORARY_CONTAINER = 'tab-new-temporary-container';

const MENU_ID_CONTEXT_TAB_NEW_TAB = 'context-tab-new-tab';
const MENU_ID_CONTEXT_TAB_SEPARATOR_1 = 'context-tab-separator-1';
const MENU_ID_CONTEXT_TAB_RELOAD_TAB = 'context-tab-reload-tab';
const MENU_ID_CONTEXT_TAB_MUTE_TAB = 'context-tab-mute-tab';
const MENU_ID_CONTEXT_TAB_PIN_TAB = 'context-tab-pin-tab';
const MENU_ID_CONTEXT_TAB_DUPLICATE_TAB = 'context-tab-duplicate-tab';
const MENU_ID_CONTEXT_TAB_SEPARATOR_2 = 'context-tab-separator-2';
const MENU_ID_CONTEXT_TAB_CLOSE_TAB = 'context-tab-close-tab';
const MENU_ID_CONTEXT_TAB_SEPARATOR_3 = 'context-tab-separator-3';

const MENU_ID_ACTION_SETTINGS = 'action-settings';

const MENU_ID_TOOLS_PANORAMA_GRID = 'tools-panorama-grid';
const MENU_ID_TOOLS_SETTINGS = 'tools-settings';

const extensionPageService = ExtensionPageService.getInstance();
const containerVisibilityService = ContainerVisibilityService.getInstance();
const temporaryContainerService = TemporaryContainerService.getInstance();

const defineTabMenuHandler = (menuItem: MenuItem, action: 'onClicked' | 'onShown', handler: (tab: CompatTab) => void) => {
  menuItem[action].addListener((info) => {
    const { tab } = info;

    if (tab == null) return;
    handler(tab);
  });
};

export const menus = {
  [MENU_ID_CONTEXT_TAB_NEW_TAB]: new PopupTabContextMenuItem({
    id: MENU_ID_CONTEXT_TAB_NEW_TAB,
    title: browser.i18n.getMessage('contextMenuNewTab'),
  }),

  [MENU_ID_CONTEXT_TAB_SEPARATOR_1]: new PopupTabContextMenuItem({
    id: MENU_ID_CONTEXT_TAB_SEPARATOR_1,
    type: 'separator',
  }),

  [MENU_ID_CONTEXT_TAB_RELOAD_TAB]: new PopupTabContextMenuItem({
    id: MENU_ID_CONTEXT_TAB_RELOAD_TAB,
    title: browser.i18n.getMessage('contextMenuReloadTab'),
  }),

  [MENU_ID_CONTEXT_TAB_MUTE_TAB]: new PopupTabContextMenuItem({
    id: MENU_ID_CONTEXT_TAB_MUTE_TAB,
    title: browser.i18n.getMessage('contextMenuMuteTab'),
  }),

  [MENU_ID_CONTEXT_TAB_PIN_TAB]: new PopupTabContextMenuItem({
    id: MENU_ID_CONTEXT_TAB_PIN_TAB,
    title: browser.i18n.getMessage('contextMenuPinTab'),
  }),

  [MENU_ID_CONTEXT_TAB_DUPLICATE_TAB]: new PopupTabContextMenuItem({
    id: MENU_ID_CONTEXT_TAB_DUPLICATE_TAB,
    title: browser.i18n.getMessage('contextMenuDuplicateTab'),
  }),

  [MENU_ID_CONTEXT_TAB_SEPARATOR_2]: new PopupTabContextMenuItem({
    id: MENU_ID_CONTEXT_TAB_SEPARATOR_2,
    type: 'separator',
  }),

  [MENU_ID_CONTEXT_TAB_CLOSE_TAB]: new PopupTabContextMenuItem({
    id: MENU_ID_CONTEXT_TAB_CLOSE_TAB,
    title: browser.i18n.getMessage('contextMenuCloseTab'),
  }),

  [MENU_ID_CONTEXT_TAB_SEPARATOR_3]: new PopupTabContextMenuItem({
    id: MENU_ID_CONTEXT_TAB_SEPARATOR_3,
    type: 'separator',
  }),

  [MENU_ID_TAB_HIDE_CONTAINER]: new MenuItem({
    id: MENU_ID_TAB_HIDE_CONTAINER,
    title: browser.i18n.getMessage('contextMenuHideSelectedContainer'),
    contexts: ['tab'],
  }),

  [MENU_ID_TAB_FOCUS_CONTAINER]: new MenuItem({
    id: MENU_ID_TAB_FOCUS_CONTAINER,
    title: browser.i18n.getMessage('focusToThisContainer'),
    contexts: ['tab'],
  }),

  [MENU_ID_TAB_NEW_TEMPORARY_CONTAINER]: new MenuItem({
    id: MENU_ID_TAB_NEW_TEMPORARY_CONTAINER,
    title: browser.i18n.getMessage('buttonNewTemporaryContainer'),
    contexts: ['tab'],
  }),

  [MENU_ID_ACTION_SETTINGS]: new MenuItem({
    id: MENU_ID_ACTION_SETTINGS,
    title: browser.i18n.getMessage('buttonSettings'),
    contexts: ['browser_action', 'page_action'],
  }),

  [MENU_ID_TOOLS_PANORAMA_GRID]: new MenuItem({
    id: MENU_ID_TOOLS_PANORAMA_GRID,
    title: browser.i18n.getMessage('panoramaGrid'),
    contexts: ['tools_menu'],
  }),

  [MENU_ID_TOOLS_SETTINGS]: new MenuItem({
    id: MENU_ID_TOOLS_SETTINGS,
    title: browser.i18n.getMessage('buttonSettings'),
    contexts: ['tools_menu'],
  }),
};

defineTabMenuHandler(menus[MENU_ID_TAB_HIDE_CONTAINER], 'onShown', (tab) => {
  if (tab.isPrivate) {
    menus[MENU_ID_TAB_HIDE_CONTAINER].disable();
  } else {
    menus[MENU_ID_TAB_HIDE_CONTAINER].enable();
  }
});

defineTabMenuHandler(menus[MENU_ID_TAB_FOCUS_CONTAINER], 'onShown', (tab) => {
  if (tab.isPrivate) {
    menus[MENU_ID_TAB_FOCUS_CONTAINER].disable();
  } else {
    menus[MENU_ID_TAB_FOCUS_CONTAINER].enable();
  }
});

defineTabMenuHandler(menus[MENU_ID_TAB_NEW_TEMPORARY_CONTAINER], 'onShown', (tab) => {
  if (tab.isPrivate) {
    menus[MENU_ID_TAB_NEW_TEMPORARY_CONTAINER].disable();
  } else {
    menus[MENU_ID_TAB_NEW_TEMPORARY_CONTAINER].enable();
  }
});

defineTabMenuHandler(menus[MENU_ID_TAB_HIDE_CONTAINER], 'onClicked', (tab) => {
  const cookieStore = new CookieStore(tab.cookieStore.id);
  if (cookieStore.isPrivate) {
    return;
  }

  if (tab.windowId == null) {
    return;
  }

  containerVisibilityService.hideContainerOnWindow(tab.windowId, cookieStore.id).catch(e => console.error(e));
});

defineTabMenuHandler(menus[MENU_ID_TAB_FOCUS_CONTAINER], 'onClicked', (tab) => {
  const cookieStore = new CookieStore(tab.cookieStore.id);
  if (cookieStore.isPrivate) {
    return;
  }

  if (tab.windowId == null) {
    return;
  }

  const windowId = tab.windowId;

  containerVisibilityService.focusContainerOnWindow(windowId, cookieStore.id).then(() => containers.hideAll(windowId)).catch(e => console.error(e));
});

defineTabMenuHandler(menus[MENU_ID_TAB_NEW_TEMPORARY_CONTAINER], 'onClicked', (tab) => {
  const cookieStore = new CookieStore(tab.cookieStore.id);
  if (cookieStore.isPrivate) {
    return;
  }

  if (tab.windowId == null) {
    return;
  }

  temporaryContainerService.createTemporaryContainer().catch(e => console.error(e));
});

defineTabMenuHandler(menus[MENU_ID_CONTEXT_TAB_NEW_TAB], 'onClicked', (tab) => {
  browser.tabs.create({
    windowId: tab.windowId,
  }).catch((e) => {
    console.error(e);
  });
});

defineTabMenuHandler(menus[MENU_ID_CONTEXT_TAB_RELOAD_TAB], 'onClicked', (tab) => {
  browser.tabs.reload(tab.id).catch((e) => {
    console.error(e);
  });
});

defineTabMenuHandler(menus[MENU_ID_CONTEXT_TAB_MUTE_TAB], 'onShown', (tab) => {
  if (!tab.muted) {
    menus[MENU_ID_CONTEXT_TAB_MUTE_TAB].setTitle(browser.i18n.getMessage('contextMenuMuteTab'));
  } else {
    menus[MENU_ID_CONTEXT_TAB_MUTE_TAB].setTitle(browser.i18n.getMessage('contextMenuUnmuteTab'));
  }
});

defineTabMenuHandler(menus[MENU_ID_CONTEXT_TAB_MUTE_TAB], 'onClicked', (tab) => {
  browser.tabs.update(tab.id, {
    muted: !tab.muted,
  }).catch((e) => {
    console.error(e);
  });
});

defineTabMenuHandler(menus[MENU_ID_CONTEXT_TAB_PIN_TAB], 'onShown', (tab) => {
  if (!tab.pinned) {
    menus[MENU_ID_CONTEXT_TAB_PIN_TAB].setTitle(browser.i18n.getMessage('contextMenuPinTab'));
  } else {
    menus[MENU_ID_CONTEXT_TAB_PIN_TAB].setTitle(browser.i18n.getMessage('contextMenuUnpinTab'));
  }
});

defineTabMenuHandler(menus[MENU_ID_CONTEXT_TAB_PIN_TAB], 'onClicked', (tab) => {
  browser.tabs.update(tab.id, {
    pinned: !tab.pinned,
  }).catch((e) => {
    console.error(e);
  });
});

defineTabMenuHandler(menus[MENU_ID_CONTEXT_TAB_DUPLICATE_TAB], 'onClicked', (tab) => {
  browser.tabs.duplicate(tab.id).catch((e) => {
    console.error(e);
  });
});

defineTabMenuHandler(menus[MENU_ID_CONTEXT_TAB_CLOSE_TAB], 'onClicked', (tab) => {
  tab.close().catch((e) => {
    console.error(e);
  });
});

const openSettings = () => {
  browser.runtime.openOptionsPage().catch((e) => {
    console.error(e);
  });
};

menus[MENU_ID_ACTION_SETTINGS].onClicked.addListener(() => {
  openSettings();
});

menus[MENU_ID_TOOLS_PANORAMA_GRID].onClicked.addListener(() => {
  extensionPageService.openInBackground(ExtensionPageService.PANORAMA);
});

menus[MENU_ID_TOOLS_SETTINGS].onClicked.addListener(() => {
  openSettings();
});
