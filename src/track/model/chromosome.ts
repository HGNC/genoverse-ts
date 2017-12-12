import TrackModel from './../model';
import Genoverse from './../../genoverse';

// see sub-models for more specific examples
export default class ChromosomeModel extends TrackModel{
  
  colors: {[key: string]: string} = {
    acen    : '#708090',
    gneg    : '#FFFFFF',
    gpos    : '#000000',
    gpos100 : '#000000',
    gpos25  : '#D9D9D9',
    gpos33  : '#BFBFBF',
    gpos50  : '#999999',
    gpos66  : '#7F7F7F',
    gpos75  : '#666666',
    gvar    : '#E0E0E0',
    stalk   : '#708090'
  };
  labelColors: {[key: string]: string} = {
    gneg   : '#000000',
    gvar   : '#000000',
    gpos25 : '#000000',
    gpos33 : '#000000'
  };

  insertFeature(feature: any) {
    feature.label      = feature.type === 'acen' || feature.type === 'stalk' ? false : feature.id;
    feature.menuTitle  = feature.id ? feature.chr + feature.id : feature.chr + ':' + feature.start + '-' + feature.end;
    feature.color      = this.colors[feature.type] || '#FFFFFF';
    feature.labelColor = this.labelColors[feature.type] || '#FFFFFF';
    super.insertFeature(feature);
  }

  getData(chr: string, start: number, end: number) {
    this.receiveData($.extend(true, [], this.browser.genome[chr].bands), chr, start, end);
    return $.Deferred().resolveWith(this);
  }
}