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
import { EventSink } from 'weeg-events';
import { Asserts } from 'weeg-utils';

import { ExtensionListingService } from '../ExtensionListingService';
import { ServiceRegistry } from '../ServiceRegistry';

const extensionListingService = ExtensionListingService.getInstance();

export class NotificationService {
  private static readonly INSTANCE = new NotificationService();

  public static getInstance(): NotificationService {
    return NotificationService.INSTANCE;
  }

  public readonly onClicked = new EventSink<string>();

  private constructor() {
    Asserts.assertTopLevelInBackgroundScript();
    browser.notifications.onClicked.addListener((channel) => {
      this.onClicked.dispatch(channel);
    });
  }

  public async createBasic(channel: string, message: string, title?: string): Promise<void> {
    await browser.notifications.create(channel, {
      type: 'basic',
      title: title ?? extensionListingService.getExtensionName(),
      iconUrl: browser.runtime.getURL('/icon.svg'),
      message,
    });
  }

  public async clear(channel: string): Promise<void> {
    await browser.notifications.clear(channel);
  }
}

ServiceRegistry.getInstance().registerService('NotificationService', NotificationService.getInstance());
