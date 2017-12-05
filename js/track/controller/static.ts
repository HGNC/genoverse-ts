import Genoverse from './../../genoverse';
import TrackController from './../controller';
import * as $ from '../../../node_modules/jquery/dist/jquery.js';



export default abstract class StaticTrack extends TrackController {

  stringified: string;
  image: JQuery<HTMLElement>;
  controls: string;
  resizable: boolean;
  
  constructor(genoverse: Genoverse, properties?: any) {
    super(genoverse, properties);
    this.controls = 'off';
    this.resizable = false;
  }

  addDomElements(): void {
    super.addDomElements();

    this.image = $('<img>').appendTo(this.imgContainer);

    this.container.toggleClass('gv-track-container gv-track-container-static').prepend(this.imgContainer);
    this.scrollContainer.add(this.messageContainer).remove();
  }

  reset(type?: string): void {
    delete this.stringified;
    super.reset(type);
  }

  setWidth(width: number): void {
    super.setWidth(width);
    this.image.width(this.width);
  }

  makeFirstImage(moveTo?: any): JQuery.Deferred<any, any, any> {
    const def = super.makeFirstImage(moveTo);
    this.container.css('left', 0);
    this.imgContainer.show();
    return def;
  }

  makeImage(params: any): JQuery.Deferred<any, any, any> {
    if (this.disabled) {
      return $.Deferred().resolve();
    }

    const features = this.view.positionFeatures(this.model.findFeatures(params.chr, params.start, params.end), params);
    
    if (features) {
      
      const string = JSON.stringify(features);
      if (this.stringified !== string) {
        
        const height = this.height;
        

        params.width         = this.width;
        params.featureHeight = height;

        this.render(features, this.image, params);
        this.imgContainer.children(':last').show();
        this.resize(height, undefined, false);

        this.stringified = string;
      }
    }

    return $.Deferred().resolve();
  }
}
