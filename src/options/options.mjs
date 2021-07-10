
import {config} from '../modules/config.mjs';

const inputNewTabKeepContainer = document.querySelector('#input-newtabKeepContainer');
document.querySelector('label[for="input-newtabKeepContainer"]').textContent = browser.i18n.getMessage('labelNewTabKeepContainer');

const inputFirstPartyIsolate = document.querySelector('#input-firstPartyIsolate');
document.querySelector('label[for="input-firstPartyIsolate"]').textContent = browser.i18n.getMessage('labelFirstPartyIsolate');

config.observe('newtab.keepContainer', (value) => {
    if (undefined === value) {
        config.set('newtab.keepContainer', true);
        return;
    }
    inputNewTabKeepContainer.checked = value;
});

inputNewTabKeepContainer.addEventListener('change', (ev) => {
    config.set('newtab.keepContainer', ev.target.checked)
    .catch(e => console.error(e));
});

browser.privacy.websites.firstPartyIsolate.get({}).then((details) => {
    inputFirstPartyIsolate.checked = details.value;
});

browser.privacy.websites.firstPartyIsolate.onChange.addListener((details) => {
    inputFirstPartyIsolate.checked = details.value;
});

inputFirstPartyIsolate.addEventListener('change', (ev) => {
    browser.privacy.websites.firstPartyIsolate.set({
        value: ev.target.checked,
    }).catch((e) => console.error(e));
});