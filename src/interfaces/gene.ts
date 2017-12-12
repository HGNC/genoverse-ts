import Genoverse from './../genoverse';
import TrackModel from './../track/model';
import TrackView from './../track/view';

export enum Bump {False, True, Label}

export type Model = {
  new(genoverse: Genoverse): TrackModel;
};

export type View = {
  new(genoverse: Genoverse, properties?: any): TrackView;
};

export interface GeneTrackProperties {
  name: string,
  height: number,
  legend: boolean,
  labels: boolean,
  margin: number,
  resizable: boolean,
  lengthDependentMV: [{
    minLength: number
    model:{
      class: Model
    },
    view: {
      class: View,
      properties?: any
    }
  }]
}

export interface GeneViewProperties {
  margin: number,
  height: number,
  featureHeight: number,
  repeatLabels: boolean,
  intronStyle?: string,
  intronLineWidth?: number,
  utrHeight?: number,
  bump: Bump,
  labels: boolean|string,
  width: number
}

export interface GeneModelPropeties {
  url: string,
  dataRequestLimit: number
}