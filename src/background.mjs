// vim: ts=2 et ai

import * as containers from './modules/containers.mjs';
import { isNewTabPage } from './modules/newtab.mjs';

import {WebExtensionsBroadcastChannel} from './modules/broadcasting.mjs';
import '/install.mjs';
import { getActiveUserContext } from './modules/usercontext-state.mjs';
import {config} from './modules/config.mjs';


const tabChangeChannel = new WebExtensionsBroadcastChannel('tab_change');

let tabSorting = false;
let configNewTabInContainerEnabled = true;
config.observe('newtab.keepContainer', (value) => {
  if (undefined !== value) {
    configNewTabInContainerEnabled = value;
  }
});


globalThis.getWindowIds = async () => {
  try {
    const windows = await browser.windows.getAll({
      populate: false,
      windowTypes: ['normal'],
    });
    return windows.map(window => window.id);
  } catch (e) {
    return [];
  }
};

globalThis.sortTabsByWindow = async (windowId) => {
  try {
    const tabs = await browser.tabs.query({windowId: windowId});
    const pinnedTabs = tabs.filter(tab => tab.pinned);
    const sortedTabs = tabs.filter(tab => !tab.pinned);
    sortedTabs.sort((tab1, tab2) => {
      const userContextId1 = containers.toUserContextId(tab1.cookieStoreId);
      const userContextId2 = containers.toUserContextId(tab2.cookieStoreId);
      return userContextId1 - userContextId2;
    });
    const pinnedCount = pinnedTabs.length;
    for (let i = 0; i < sortedTabs.length; i++) {
      const tab = sortedTabs[i];
      const currentIndex = tab.index;
      const targetIndex = pinnedCount + i;
      if (targetIndex != currentIndex) {
        await browser.tabs.move(tab.id, {index: targetIndex});
      }
    }
  } catch (e) {
    console.error(e);
  }
};

globalThis.sortTabs = async () => {
  if (tabSorting) return;
  tabSorting = true;
  try {
    for (const windowId of await getWindowIds()) {
      await sortTabsByWindow(windowId);
    }
  } catch (e) {
    console.error(e);
  } finally {
    tabSorting = false;
  }
};

browser.tabs.onAttached.addListener(async () => {
  await sortTabs();
  tabChangeChannel.postMessage(true);
});

browser.tabs.onCreated.addListener(async (tab) => {
  const userContextId = containers.toUserContextId(tab.cookieStoreId);
  const activeUserContextId = getActiveUserContext(tab.windowId);
  if (configNewTabInContainerEnabled && tab.url == 'about:newtab' && 0 == userContextId && 0 != activeUserContextId) {
    console.log('active user context: %d for window %d', getActiveUserContext(tab.windowId), tab.windowId);
    await containers.reopenInContainer(activeUserContextId, tab.id);
  }
  await sortTabs();
  tabChangeChannel.postMessage(true);
});

browser.tabs.onMoved.addListener(async (tabId, movedInfo) => {
  const tab = await browser.tabs.get(tabId);
  if (tab.pinned) {
    return;
  }
  let prevTab, nextTab;
  try {
    prevTab = (await browser.tabs.query({
      windowId: tab.windowId,
      index: tab.index - 1,
      pinned: false,
    }))[0];
  } catch (e) {}
  try {
    nextTab = (await browser.tabs.query({
      windowId: tab.windowId,
      index: tab.index + 1,
    }))[0];
  } catch (e) {}
  if (prevTab || nextTab) {
    if (prevTab && nextTab && prevTab.cookieStoreId == nextTab.cookieStoreId) {
      const targetUserContextId = containers.toUserContextId(prevTab.cookieStoreId);
      await containers.reopenInContainer(targetUserContextId, tab.id);
    } else if (prevTab && !nextTab) {
      const targetUserContextId = containers.toUserContextId(prevTab.cookieStoreId);
      await containers.reopenInContainer(targetUserContextId, tab.id);
    } else if (!prevTab && nextTab) {
      const targetUserContextId = containers.toUserContextId(nextTab.cookieStoreId);
      await containers.reopenInContainer(targetUserContextId, tab.id);
    }
  }
  await sortTabs();
  tabChangeChannel.postMessage(true);
});

browser.tabs.onUpdated.addListener(async () => {
  await sortTabs();
  tabChangeChannel.postMessage(true);
}, {
  properties: [
    'pinned',
  ],
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //console.log('tab %d hidden on window %d', tabId, tab.windowId);
  tabChangeChannel.postMessage(true);
}, {
  properties: [
    'hidden',
  ],
});

browser.tabs.onActivated.addListener(async ({tabId, windowId}) => {
  //console.log('active tab changed on window %d', windowId);
  const tab = await browser.tabs.get(tabId);
  const userContextId = containers.toUserContextId(tab.cookieStoreId);
  if (!tab.pinned) {
    await containers.show(userContextId, windowId);
  }
});

browser.contextualIdentities.onRemoved.addListener(({contextualIdentity}) => {
  const userContextId = containers.toUserContextId(contextualIdentity.cookieStoreId);
  console.log('userContext %d removed', userContextId);
  containers.closeAllTabs(userContextId).then(() => {
    console.log('Closed all tabs for userContext %d', userContextId);
  }).catch(err => {
    console.error('cleanup failed for userContext %d', userContextId);
  });
});

sortTabs();

browser.menus.create({
  id: 'tab-hide-container',
  title: browser.i18n.getMessage('contextMenuHideSelectedContainer'),
  contexts: ['tab'],
});

browser.menus.onClicked.addListener((info, tab) => {
  if (info.menuItemId == 'tab-hide-container') {
    const userContextId = containers.toUserContextId(tab.cookieStoreId);
    containers.hide(userContextId, tab.windowId).catch(e => console.error(e));
  }
});
