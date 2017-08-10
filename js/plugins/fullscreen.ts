import Genoverse from '../genoverse';

function create() {
  const browser: Genoverse = this;
  let supported   = true;
  const eventName   = 'fullscreenchange';  // All the browsers have different names
  const elemName    = 'fullscreenElement'; // ... even the capitalisation varies!
  const requestName = 'requestFullscreen';
  const cancelName  = 'exitFullscreen';

  if (!document.onfullscreenchange) {
    supported = false;
  }

  browser.fullscreenVars = {
    eventName   : eventName,
    elemName    : elemName,
    cancelName  : cancelName,
    requestName : requestName,

    enterEvent: (browser: Genoverse) => {
      browser.preFullscreenWidth = browser.superContainer.width();
      browser.superContainer.addClass('gv-fullscreen');
      browser.setWidth(window.innerWidth);
      browser.controlPanel.find('.gv-fullscreen-button .fa').removeClass('fa-expand').addClass('fa-compress');
    },

    exitEvent: (browser: Genoverse) => {
      if (browser.superContainer.hasClass('gv-fullscreen')) {
        browser.superContainer.removeClass('gv-fullscreen');
        browser.setWidth(browser.preFullscreenWidth);
        browser.controlPanel.find('.gv-fullscreen-button .fa').removeClass('fa-compress').addClass('fa-expand');
      }
    },

    eventListener: () => {
      if (!browser.superContainer.is((<any>document)[browser.fullscreenVars.elemName])) {
        browser.fullscreenVars.exitEvent(browser);
        document.removeEventListener(browser.fullscreenVars.eventName, browser.fullscreenVars.eventListener);
      }
    }
  };

  if (supported) {
    browser.controls.push({
      icon    : '<i class="fa fa-expand"></i>',
      'class' : 'gv-fullscreen-button',
      name    : 'Toggle fullscreen view',
      action  : (browser: Genoverse) => {
        if (browser.superContainer.hasClass('gv-fullscreen')) {
          (<any>document)[browser.fullscreenVars.cancelName]();
        } else {
          document.addEventListener(browser.fullscreenVars.eventName, browser.fullscreenVars.eventListener);
          browser.superContainer[0][browser.fullscreenVars.requestName]();
          browser.fullscreenVars.enterEvent(browser);
        }
      }
    });
  }
};

const fullscreen = {
  requires: ['controlPanel'],
  create: create
};

export default fullscreen;