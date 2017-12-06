import Genoverse from './../../genoverse';
import TrackController from './../controller';
import TrackModel from './../model';
import TrackView from './../view';
import {GeneTrackProperties, Model, View} from './../../interfaces/gene';
import * as $ from 'jquery';


export default abstract class GeneTrack extends TrackController {

  lengthDependentMV: [{
    minLength: number
    labels: boolean,
    model: {
      class: Model
    },
    view: {
      class: View,
      properties?: any
    }
  }];

  viewProperties: Object;

  abstract populateMenu(feature: any);
  
  constructor(genoverse: Genoverse, properties: GeneTrackProperties) {
    super(genoverse, properties);
    this.width = this.browser.width;
    this.lengthDependentMV = this.lengthDependentMV.sort(function (a, b) { return b.minLength - a.minLength; });
    this.init();
  }

  setEvents(): void {
    $.noop;
  }

  _getSettingsForLength() {
    const length = this.browser.length || (this.browser.end - this.browser.start + 1);
    for (var i = 0; i < this.lengthDependentMV.length; i++) {
      if (length > this.lengthDependentMV[i].minLength || length === 1 && this.lengthDependentMV[i].minLength === 1) {
        return this.lengthDependentMV[i];
      }
    }
    throw new Error('A default lengthDependentMV i.e with minLength 1 was not provided');
  }

  createModel(): TrackModel {
    const Model: Model = this._getSettingsForLength().model.class;
    return new Model(this.browser);
  }

  createView(properties: any): TrackView {
    const v = this._getSettingsForLength().view;
    const View: View = v.class;
    $.extend(<Object>properties, v.properties);
    this.viewProperties = properties;
    return new View(this.browser, properties);
  }
}