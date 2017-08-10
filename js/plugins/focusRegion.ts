import Genoverse from '../genoverse';

function create() {
  this.controls.push({
    icon    : '<i class="fa fa-map-marker"></i>',
    'class' : 'gv-button-large',
    name    : 'Reset focus to ' + (this.focusRegion && this.focusRegion.name ? this.focusRegion.name : this.chr + ':' + this.start + '-' + this.end),
    action  : (browser: Genoverse) => { browser.moveTo(browser.focusRegion.chr, browser.focusRegion.start, browser.focusRegion.end, true); },
    init    : (browser: Genoverse) => { browser.focusRegion = browser.focusRegion || { chr: browser.chr, start: browser.start, end: browser.end }; }
  });
};

const focusRegion = {
  requires: ['controlPanel'],
  create: create
};

export default focusRegion;