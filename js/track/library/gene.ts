import Genoverse from './../../genoverse';
import TrackController from './../../track';
import * as $ from 'jquery';

interface GeneTrackProperties {
  name: string,
  height: number,
  legend: boolean,
  labels: boolean,
  margin: number
}

export default abstract class GeneTrack extends TrackController {

  abstract populateMenu(feature: any);
  
  constructor(genoverse: Genoverse, properties?: GeneTrackProperties) {
    super(genoverse, properties);
    this.width = this.browser.width;
    this.init();
  }

  setEvents(): void {
    $.noop;
  }
}