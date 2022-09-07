// -*- indent-tabs-mode: nil; tab-width: 2; -*-
// vim: set ts=&2 sw=2 et ai :

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

export const TEMPLATE = `
<div id='main' class='content'>
  <div id='topbox'>
    <div id='search-wrapper'>
      <input type='search' id='search'/>
    </div>
    <button id='button-new-container'>
      <span class='button-text'>buttonNewContainer</span>
    </button>
    <button id='button-sidebar'>
      <span class='button-text'>buttonSidebar</span>
    </button>
    <button id='button-panorama'>
      <span class='button-text'>buttonPanorama</span>
    </button>
  </div>
  <div id='main-inner' class='menu-part'>
    <ul id='menuList' class='menu-list'></ul>
  </div>
</div>
<div id='windows' class='content'>
  <div id='windows-inner' class='menu-part'>
    <button id='button-new-window'>
      <span class='button-text'>buttonNewWindow</span>
    </button>
    <ul id='windowMenuList' class='menu-list'></ul>
  </div>
</div>
<div id='sites' class='content' data-active-content='sites'>
  <div id='sites-pane-top' data-content-id='sites'></div>
  <div id='sites-pane-details' data-content-id='sites-details'>
    <div class='heading'>
      <button id='site-pane-details-back-button'></button>
      <div id='site-pane-details-domain'></div>
    </div>
    <div id='siteMenuList' class='menu-list'></div>
  </div>
</div>
<div id='bottombox' class='menu-part'>
  <nav id='bottom-menu'>
    <a id='menu-item-main' class='menu-item' href='#main'>
      <span class='button-text'>menuItemContainers</span>
    </a>
    <a id='menu-item-windows' class='menu-item' href='#windows'>
      <span class='button-text'>menuItemWindows</span>
    </a>
    <a id='menu-item-sites' class='menu-item' href='#sites'>
      <span class='button-text'>menuItemSites</span>
    </a>
    <a id='menu-item-settings' class='menu-item' href='#settings'>
      <span class='button-text'>buttonSettings</span>
    </a>
  </nav>
</div>
<div id='confirm' class='modal'>
  <div class='modal-content'>
    <p id='confirm-message'></p>
    <div class='modal-actions'>
      <button id='confirm-cancel-button'>buttonCancel</button>
      <button id='confirm-ok-button' class='button-default'>buttonOk</button>
    </div>
  </div>
</div>
<div id='new-container' class='modal'>
  <div class='modal-content'>
    <h2 class='modal-title'></h2>
    <div class='input-box'>
      <label for='new-container-name'>newContainerNameLabel</label>
      <input class='input-box-input' type='text' name='name' id='new-container-name' placeholder='newContainerNamePlaceholder'/>
    </div>
    <usercontext-iconpicker id='new-container-icon'></usercontext-iconpicker>
    <usercontext-colorpicker id='new-container-color'></usercontext-colorpicker>
    <div class='modal-actions'>
      <button id='new-container-cancel-button'>buttonCancel</button>
      <button id='new-container-ok-button' class='button-default'>buttonOk</button>
    </div>
  </div>
</div>
`;
