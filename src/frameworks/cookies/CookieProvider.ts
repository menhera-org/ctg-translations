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
import { OriginAttributes } from '../tabGroups';
import { FirstPartyService } from '../tabGroups';
import { HostnameService } from '../dns';

export class CookieProvider {
  private _firstPartyService = FirstPartyService.getInstance();
  private _hostnameService = HostnameService.getInstance();

  private validateOriginAttributes(originAttributes: OriginAttributes): void {
    if (!originAttributes.hasCookieStoreId()) {
      throw new Error('OriginAttributes must have a cookieStoreId');
    }
  }

  public async getCookiesForOriginAttributes(originAttributes: OriginAttributes): Promise<browser.Cookies.Cookie[]> {
    this.validateOriginAttributes(originAttributes);
    const domain = originAttributes.hasFirstpartyDomain() ? originAttributes.firstpartyDomain : undefined;
    const cookieStoreId = originAttributes.cookieStoreId;
    const partitionKey = {};
    const firstPartyDomain = null;
    return await browser.cookies.getAll({
      domain,
      firstPartyDomain,
      storeId: cookieStoreId,
      partitionKey,
    });
  }

  public async getCookieDomainsForOriginAttributes(originAttributes: OriginAttributes): Promise<string[]> {
    const cookies = await this.getCookiesForOriginAttributes(originAttributes);
    const domains = new Set<string>();
    for (const cookie of cookies) {
      if (this._hostnameService.isHostnameIpAddress(`http://${cookie.domain}`)) {
        continue;
      }
      const domain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
      domains.add(domain);
    }
    return this._hostnameService.sortDomains(domains);
  }

  public async getCookieRegistrableDomainsForOriginAttributes(originAttributes: OriginAttributes): Promise<string[]> {
    await this._firstPartyService.initialized;
    const domains = await this.getCookieDomainsForOriginAttributes(originAttributes);
    return this._firstPartyService.getUniqueRegistrableDomains(domains);
  }

  public async removeDataForOriginAttributes(originAttributes: OriginAttributes): Promise<void> {
    this.validateOriginAttributes(originAttributes);
    const hostnames = await this.getCookieDomainsForOriginAttributes(originAttributes);
    const cookieStoreId = originAttributes.cookieStoreId;
    await browser.browsingData.remove({
      hostnames,
      originTypes: {
        unprotectedWeb: true,
      },
      cookieStoreId,
    }, {
      cookies: true,
      localStorage: true,
      indexedDB: true,
    });
  }
}