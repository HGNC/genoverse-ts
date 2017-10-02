import Genoverse from  '../genoverse';
import * as $ from 'jquery';
import 'jquery-ui';
import './../lib/jquery-hashchange';
import './../lib/jquery-mousehold';

function create() {
  this.controls = [
    // Scroll left/right
    {
      name    : 'Scroll left and right by pressing and holding these buttons',
      buttons : [{
        name    : 'Scroll left',
        icon    : '<i class="fa fa-chevron-left"></i>',
        'class' : 'gv-scroll-left'
      }, {
        name    : 'Scroll right',
        icon    : '<i class="fa fa-chevron-right"></i>',
        'class' : 'gv-scroll-right'
      }],
      init: function (browser: Genoverse) {
        const el = $(this);

        el.find('.gv-scroll-left, .gv-scroll-right').on({
          mousedown : function () {
            browser.startDragScroll();
          },
          mouseup   : function () {
            browser.stopDragScroll();
          }
        });

        el.find('.gv-scroll-left').mousehold(50, function () {
          browser.move(browser.scrollDelta);
        });

        el.find('.gv-scroll-right').mousehold(50, function () {
          browser.move(-browser.scrollDelta);
        });
      }
    },

    // Zoom in/out
    {
      name    : 'Zoom-in and zoom-out',
      buttons : [{
        name    : 'Zoom in',
        icon    : '<i class="fa fa-search-plus"></i>',
        'class' : 'gv-zoom-in',
        action  : function (browser: Genoverse) { browser.zoomIn(); }
      }, {
        name    : 'Zoom out',
        icon    : '<i class="fa fa-search-minus"></i>',
        'class' : 'gv-zoom-out',
        action  : function (browser: Genoverse) { browser.zoomOut(); }
      }]
    },

    // Toogle drag action
    {
      name    : 'Toggle your mouse drag action between scroll left/right and select region',
      buttons : [{
        name    : 'Mouse drag action to scroll the browser left or right',
        icon    : '<i class="fa fa-arrows-h"></i>',
        'class' : 'gv-drag-scroll',
        action  : function (browser: Genoverse) {
          browser.setDragAction('scroll');
          $(this).addClass('gv-active').siblings().removeClass('gv-active');
        }
      }, {
        name    : 'Mouse drag action to select a region',
        icon    : '<i></i>',
        'class' : 'gv-drag-select',
        action  : function (browser: Genoverse) {
          browser.setDragAction('select');
          $(this).addClass('gv-active').siblings().removeClass('gv-active');
        }
      }],
      init: function (browser: Genoverse) {
        $(this).find('.gv-drag-' + browser.dragAction).addClass('gv-active').siblings().removeClass('gv-active');
      }
    },

    // Toogle wheel action
    {
      name    : 'Toggle your mouse wheel action between zoom in/out and default page scroll',
      buttons : [{
        name    : 'Mouse wheel action to scroll the page up and down',
        icon    : '<i class="fa fa-arrows-v"></i>',
        'class' : 'gv-wheel-off',
        action  : function (browser: Genoverse) {
          browser.setWheelAction('off');
          $(this).addClass('gv-active').siblings().removeClass('gv-active');
        }
      }, {
        name    : 'Mouse wheel to zoom in and out',
        icon    : '&#177;',
        'class' : 'gv-wheel-zoom',
        action  : function (browser: Genoverse) {
          browser.setWheelAction('zoom');
          $(this).addClass('gv-active').siblings().removeClass('gv-active');
        }
      }],
      init: function (browser: Genoverse) {
        $(this).find('.gv-wheel-' + browser.wheelAction).addClass('gv-active').siblings().removeClass('gv-active');
      }
    }
  ];

  if (this.saveable) {
    this.controls.push({
      icon   : '<i class="fa fa-undo"></i>',
      name   : 'Reset tracks and configuration',
      action : function (browser: Genoverse) { browser.resetConfig(); }
    });
  }
  
  this.on({
    beforeInit: function () {
      const browser = this;
      if (!this.tracksLibrary) {
        this.tracksLibrary = [];
        $.each(this.tracks, (index: number, track: any): void => {
          const trackName: string = track.Name;
          if(trackName) this.tracksLibrary.push(track);
        });
      }

      const panel = $(
        '<table cellspacing=0 cellpadding=0 class="gv">' +
        '  <tr>' +
        '    <td class="gv-panel gv-panel-left"></td>' +
        '    <td class="gv-canvas-container"></td>' +
        '    <td class="gv-panel gv-panel-right"></td>' +
        '  </tr>' +
        '</table>'
      ).appendTo(this.container).find('.gv-panel-right');

      this.controlPanel   = panel;
      this.superContainer = this.container;
      this.container      = $('.gv-canvas-container', this.container);

      for (let i = 0; i < browser.controls.length; i++) {
        (function (control) {
          const buttonSet = $('<div class="gv-button-set">').attr('title', control.name).appendTo(browser.superContainer.find('.gv-panel-right'));
          const buttons   = control.buttons || [ control ];
          let el;

          $.each(buttons, function (i: number, button: any) {
            el = $('<button>' + button.icon + '</button>').addClass(button['class']).attr('title', button.name).appendTo(buttonSet);

            if (button.action) {
              el.on('click', function () {
                button.action.call(this, browser);
              });
            }

            if (button.init && button !== control) {
              button.init.call(el[0], browser);
            }
          });

          if (control.init) {
            control.init.call(buttonSet, browser);
          }
        })(browser.controls[i]);
      }

      this.superContainer.width(this.width);

      this.width -= panel.width();

      // ESC key to toggle crosshair select to drag mode and close menus
      $(document).on('keydown', function (e: any) {
        if (e.keyCode === 27) {
          if (panel.find('button.gv-drag-select').hasClass('gv-active')) {
            panel.find('button.gv-drag-scroll').trigger('click');
          }

          $('.gv-menu .gv-close').trigger('click');
        }
      });
    },

    afterInit: function () {
      let browser      = this;
      var tracksButton = $('<button title="Tracks menu"><i class="fa fa-navicon"></i> Tracks</button>').on('click', function () {
        let button = this;

        function getTrackTags(track: any, tags: any[]) {
          if (track.constructor && track.constructor.ancestor && track.constructor.ancestor.prototype) {
            tags = getTrackTags(track.constructor.ancestor.prototype, tags.concat(track.constructor.ancestor.prototype.tags || []));
          }

          return tags;
        }

        if ($(this).hasClass('gv-active')) {
          $('.gv-menu.gv-tracks-menu .gv-close').trigger('click');
          $(this).removeClass('gv-active');
        } else {
          let menu = $(this).data('menu');

          if (menu) {
            menu.show();
          } else {
            menu = browser.makeMenu({
              'Currently enabled tracks:'             : 'Available tracks:',
              '<div class="gv-current-tracks"></div>' : '<input placeholder="Search"><div class="gv-available-tracks"></div>'
            }).addClass('gv-tracks-menu');

            menu.css({ marginLeft: menu.width() / -2 });

            $('input[placeholder=Search]', menu).on('keyup', function () {
              const str = (<HTMLInputElement>this).value.toLowerCase();

              $('.gv-tracks-library-item', menu).each(function () {
                const track = $(this).data('track');
                let match = false;

                if (track.name && track.name.toLowerCase().indexOf(str) >= 0) {
                  match = true;
                } else {
                  let tags = getTrackTags(track, []).concat(track.tags || []);

                  for (let i = 0; i < tags.length; i++) {
                    if (tags[i].toLowerCase().indexOf(str) >= 0) {
                      match = true;
                      break;
                    }
                  }
                }

                $(this)[match ? 'show' : 'hide']();
              });
            });

            $('.gv-close', menu).on('click', function () {
              $(button).removeClass('gv-active');
            });

            let availableTracks = $('.gv-available-tracks', menu);
            let currentTracks   = $('.gv-current-tracks',   menu).data({
              reload     : function () { $(this).empty().data('listTracks')(); },
              listTracks : function () {
                for (let i = 0; i < browser.tracks.length; i++) {
                  if (browser.tracks[i].name && browser.tracks[i].removable !== false && !browser.tracks[i].parentTrack) {
                    (function (track) {
                      $('<div>')
                        .append($('<i class="gv-remove-track gv-menu-button fa fa-times-circle">').on('click', function () { track.remove(); }))
                        .append('<span>' + track.name + '</span>')
                        .appendTo(currentTracks)
                        .data('track', track)
                        .addClass(track.unsortable ? 'gv-unsortable' : '');
                    })(browser.tracks[i]);
                  }
                }
              }
            }).sortable({
              items  : 'div:not(.gv-unsortable)',
              cursor : 'move',
              axis   : 'y',
              handle : 'span',
              update : $.proxy(browser.updateTrackOrder, browser)
            });

            currentTracks.data('listTracks')();
            if (browser.tracksLibrary && browser.tracksLibrary.length) {
              const tracksLibrary = $.map(browser.tracksLibrary, function (track: any) {
                if(track.Name){
                  return [[ track.Name.toLowerCase(), track ]]
                }
                return undefined;
              }).sort(function (a: any, b: any) {
                return a[0] > b[0] ? 1 : -1;
              });
              
              for (let i = 0; i < tracksLibrary.length; i++) {
                (function (track: any) {
                  $('<div class="gv-tracks-library-item">').append(
                    $('<i class="gv-add-track gv-menu-button fa fa-plus-circle"> ').on('click', function () {
                      const sortableTracks = $.grep(browser.tracks, function (t: any) { return t.unsortable !== true; });
                      // NEED TO LOOK INTO THIS!!!
                      browser.trackIds = browser.trackIds || {};
                      browser.trackIds[track.prototype.id] = browser.trackIds[track.prototype.id] || 1;
                      const trk = new track(browser);
                      browser.addTrack($.extend(trk, {
                        id: track.prototype.id + (browser.tracksById[track.prototype.id] ? browser.trackIds[track.prototype.id]++ : '')
                      }));
                      trk.reset();
                      
                    })
                  ).append('<span>' + track.Name + '</span>').appendTo(availableTracks).data('track', track);
                })(tracksLibrary[i][1]);
              }
            }

            $(this).data('menu', menu);
          }

          $(this).addClass('gv-active');
        }
      });

      this.labelContainer.prepend(
        $('<li class="gv-unsortable">').append(
          $('<div class="gv-button-set" title="Tracks menu">').append(tracksButton)
        )
      );
    },

    afterAddDomElements: function () {
      this.wrapper.after('<div class="gv-powered-by">Powered by <a target="_blank" href="http://genoverse.org">Genoverse</a></div>');
      this.superContainer.find('.gv-panel-left').append(this.labelContainer);
    },

    'afterAddTracks afterRemoveTracks': function () {
      const currentTracks = this.superContainer.find('.gv-tracks-menu .gv-current-tracks');

      if (currentTracks.length) {
        currentTracks.data('reload').call(currentTracks);
      }
    }
  });
  
}

export default {
  create: create,
  requires: ['karyotype']
};
