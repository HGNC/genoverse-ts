import Genoverse from './../../../genoverse';
import LegendTrack from './../static/legend';
import GeneTrack from './../gene';
import TrackView from './../../view';
import TrackModel from './../../model';
import EnsemblGeneView from './../../view/gene/ensembl';
import EnsemblGeneModel from './../../model/gene/ensembl';
import EnsemblTranscriptView from './../../view/transcript/ensembl';
import EnsemblTranscriptModel from './../../model/transcript/ensembl';
import { Bump } from './../../../interfaces/gene';
import * as $ from 'jquery';

export default class EnsemblGeneTrack extends GeneTrack {

  legendTrack: LegendTrack;
  legendType: string;
  modelStore:  {
    [name: string]: TrackModel
  };
  viewStore:  {
    [name: string]: TrackView
  };

  public static Name: string = 'Ensembl Genes';

  constructor(genoverse: Genoverse) {
    super(genoverse, {
      name: EnsemblGeneTrack.Name,
      height: 200,
      legend: true,
      labels: true,
      margin: 2,
      resizable: true,
      lengthDependentMV: [
        { // This one applies when > 2M base-pairs per screen
          minLength: 2000000,
          model: {
            class: EnsemblGeneModel
          },
          view: {
            class: EnsemblGeneView,
            properties: {label: false}
          }
        },
        { // more than 100K but less then 2M
          minLength: 100000,
          model: {
            class: EnsemblGeneModel
          },
          view: {
            class: EnsemblGeneView,
            properties: {label: true}
          }
        },
        { // > 1 base-pair, but less then 100K
          minLength: 1,
          model: {
            class: EnsemblTranscriptModel
          },
          view: {
            class: EnsemblTranscriptView,
            properties: {
              label: true,
              featureHeight: 10,
              labels: 'default',
              repeatLabels:  true,
              bump: Bump.True,
              intronStyle: 'curve',
              intronLineWidth: 0.5,
              utrHeight: 7
            }
          }
        }
      ]
    });

    this.modelStore = {
      'EnsemblTranscriptModel': undefined,
      'EnsemblGeneModel': undefined
    };

    this.viewStore = {
      'EnsemblTranscriptView': undefined,
      'EnsemblGeneView': undefined
    };
  }

  init(): void {
    this.model = this.createModel();
    this.setDefaults();
    this.addDomElements();
    this.addUserEventHandlers();
    this.deferreds = []; // tracks deferreds so they can be stopped if the track is destroyed
    this.view = this.createView();
  }

  makeFirstImage(moveTo?: any): JQuery.Deferred<any, any, any> {
    this.modelStore[this.model.constructor.name] = this.model;
    this.viewStore[this.view.constructor.name] = this.view;
    const settings = this._getSettingsForLength();
    if(settings.model.class.name !== this.model.constructor.name){
      if(this.modelStore[settings.model.class.name]){
        this.model = this.modelStore[settings.model.class.name];
      } else {
        const Model = settings.model.class;
        this.model = new Model(this.browser);
      }
    }
    if(settings.view.class.name !== this.view.constructor.name){
      if(this.viewStore[settings.view.class.name]){
        this.view = this.viewStore[settings.view.class.name];
      } else {
        const View = settings.view.class;
        $.extend(this.viewProperties, settings.view.properties);
        this.view = new View(this.browser, this.viewProperties);
      }
    }
    this.setScale();

    const deferred = super.makeFirstImage(moveTo);
    if (this.legend) {
      deferred.done(() => {
        this.addLegend();
      });
    }
    
    return deferred;
  }

  addLegend() {
    if (!this.legend) {
      return;
    }

    this.legendType = 'Ensembl';
    const config = {
      id: this.legendType + 'Legend',
      name: 'Ensembl Gene Legend',
      type: this.legendType,
      width: this.width,
      height: 100,
      margin: 0
    };

    const track = this;
    if(this.legendTrack instanceof LegendTrack){
      this.legendTrack.remove();
    }
    this.legendTrack  = new LegendTrack(this.browser, config);
  }

  createView() {
    const prop = {
      margin: this.margin,
      height: this.height,
      featureHeight: 5,
      minLabelHeight: 29,
      width: this.width,
      labels: true,
      repeatLabels: true,
      bump: Bump.True,
      resizable: this.resizable
    };
    return super.createView(prop);
  }

  populateMenu(feature: any) {
    const url  = 'http://www.ensembl.org/Homo_sapiens/' + (feature.feature_type === 'transcript' ? 'Transcript' : 'Gene') + '/Summary?' + (feature.feature_type === 'transcript' ? 't' : 'g') + '=' + feature.id;
    const menu: {[key: string]: any} = {
      title    : '<a target="_blank" href="' + url + '">' + (feature.external_name ? feature.external_name + ' (' + feature.id + ')' : feature.id) + '</a>',
      Location : feature.chr + ':' + feature.start + '-' + feature.end,
      Source   : feature.source,
      Biotype  : feature.biotype
    };

    if (feature.feature_type === 'transcript') {
      menu.Gene = '<a target="_blank" href="http://www.ensembl.org/Homo_sapiens/Gene/Summary?g=' + feature.Parent + '">' + feature.Parent + '</a>';
    }

    return menu;
  }

}