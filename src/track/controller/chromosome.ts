import Genoverse from './../../genoverse';
import TrackController from './../controller';
import ChromosomeModel from './../model/chromosome';
import ChromosomeView from './../view/chromosome';
import * as $ from 'jquery';
import './../../lib/jquery-tipsy';

export default class ChromosomeTrack extends TrackController {
  hoverFeature: any;
  id: string;
  margin: number;
  featureMargin: { [key: string]: number };
  labels: string;
  url: boolean;
  allData: boolean;
  height: number;
  featureHeight: number;
  border: boolean;
  legend: boolean;
  unsortable: boolean;
  name: string;
  width: number;
  //model: ChromosomeModel;
  //view: ChromosomeView;

  constructor(genoverse: Genoverse, properties?: any) {
    super(genoverse, properties);
    
    this.margin = 1;
    this.height = 20;
    this.featureHeight = 20;
    this.model = this.createModel();
    this.setDefaults();
    this.id = 'chromosome';
    this.labels = 'overlay';
    this.url = false;
    this.allData = true;
    this.border = false;
    this.legend = false;
    this.unsortable = true;
    this.name = 'Chr ' + genoverse.chr;
    this.width = genoverse.width;
    this.featureMargin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.setEvents();
    this.init();
  }

  init() {
    this.setDefaults();
    this.addDomElements();
    this.addUserEventHandlers();
    this.deferreds = []; // tracks deferreds so they can be stopped if the track is destroyed
    
    if (this.browser.scale) { // WHAT IS THIS!!!
      this.setScale();
      this.makeFirstImage();
    }
    this.view = this.createView();
    
  }

  trackFactory(genoverse: Genoverse, properties: any) {
    return new ChromosomeTrack(genoverse, properties);
  }

  setEvents(): void {
    //throw new Error("Method not implemented.");
  }

  createModel(): ChromosomeModel{
    return new ChromosomeModel(this.browser);
  }

  createView(): ChromosomeView{
    const prop = {
      featureHeight: this.defaultHeight,
      margin: this.margin,
      resizable: this.resizable,
      height: this.height,
      minLabelHeight: this.minLabelHeight,
      featureMargin: this.featureMargin,
      labels: this.labels
    };
    return new ChromosomeView(this.browser, prop);
  }

  click(e: MouseEvent) {
    var offset = this.container.parent().offset().left;
    var x = e.pageX - offset;
    var f = this.view.scaleSettings[this.browser.chr][this.scale].featurePositions.search({ x: x, y: 1, w: 1, h: 1 })[0];

    if (f) {
      if (e.type === 'mouseup') {
        if (!this.browser.parent.isStatic) {
          this.browser.parent.moveTo(f.chr, f.start, f.end, true);
        }
      } else if (this.hoverFeature !== f && !this.browser.hideTooltip) {
        this.container.tipsy('hide');

        if (f.label) {
          var left = offset + f.position[this.scale].start + f.position[this.scale].width / 2;
          this.container.attr('title', f.label[0]).tipsy({ trigger: 'manual', container: 'body' }).tipsy('show').data('tipsy').$tip.css('left', function () { return left - $(this).width() / 2; });
        }

        this.hoverFeature = f;
      }
    }
  }

  addUserEventHandlers() {
    const track = this;
    super.addUserEventHandlers();
    (<any>track.container).on({
      mousemove: function (e: MouseEvent) { track.click(e); }, //MouseEvent
      mouseout: function (e: MouseEvent) { //MouseEvent
        if (track.browser.viewPoint.is($(e.relatedTarget)) || track.browser.viewPoint.find($(e.relatedTarget)).length) {
          return true;
        }

        track.container.tipsy('hide');
        track.hoverFeature = false;
      }
    }, '.gv-image-container');

    // Don't allow zooming in and out on the karyotype image
    this.browser.on('mousewheel', '.gv-image-container, .gv-selector', function (e: Event) {
      e.stopPropagation();
    });
  }

  afterSetName() {
    this.label.css('lineHeight', this.label.height() + 'px');
  }

  populateMenu(feature: any) {
    return {
      title: feature.menuTitle,
      Position: feature.chr + ':' + feature.start + '-' + feature.end
    };
  }
}
