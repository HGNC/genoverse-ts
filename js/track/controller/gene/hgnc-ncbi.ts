import Genoverse from './../../../genoverse';
import LegendTrack from './../static/legend';
import GeneTrack from './../gene';
import TrackView from './../../view';
import TrackModel from './../../model';
import HgncNcbiGeneView from './../../view/gene/hgnc-ncbi';
import HgncNcbiGeneModel from './../../model/gene/hgnc-ncbi';
import { Bump } from './../../../interfaces/gene';
import * as $ from '../../../../node_modules/jquery/dist/jquery.js';

export default class HgncNcbiGeneTrack extends GeneTrack {

  legendTrack: LegendTrack;
  legendType: string;
  modelStore:  {
    [name: string]: TrackModel
  };
  viewStore:  {
    [name: string]: TrackView
  };

  public static Name: string = 'HGNC NCBI Genes';

  constructor(genoverse: Genoverse) {
    super(genoverse, {
      name: HgncNcbiGeneTrack.Name,
      height: 200,
      legend: true,
      labels: true,
      margin: 2,
      resizable: true,
      lengthDependentMV: [
        { // This one applies when > 2M base-pairs per screen
          minLength: 2000000,
          model: {
            class: HgncNcbiGeneModel
          },
          view: {
            class: HgncNcbiGeneView,
            properties: {label: false}
          }
        },
        { // more than 100K but less then 2M
          minLength: 1,
          model: {
            class: HgncNcbiGeneModel
          },
          view: {
            class: HgncNcbiGeneView,
            properties: {label: true}
          }
        }
      ]
    });

    this.modelStore = {
      'HgncNcbiGeneModel': undefined
    };

    this.viewStore = {
      'HgncNcbiGeneView': undefined
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

    this.legendType = 'HGNCNcbi';
    const config = {
      id: this.legendType + 'Legend',
      name: 'HGNC NCBI Gene Legend',
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
    var url  = 'http://www.ncbi.nlm.nih.gov/gene/' + feature.id;
    var sourceName = 'NCBI gene: ';
    
    var menu = {
      title    : '<a target="_blank" href="' + url + '">' + sourceName + feature.id + '</a>',
      Location : feature.chr + ':' + feature.start + '-' + feature.end,
      Source   : feature.source
    };
    if(feature.symbol){
      sourceName = feature.symbol+': ';
      menu['title'] = '<a target="_blank" href="' + url + '">' + sourceName + feature.id + '</a>';
      menu['Symbol'] = feature.symbol;
    }
    if(feature.biotype){
      menu['Biotype'] = feature.biotype;
    }
    menu['Rerun as'] = '<a href="/update/mapping.html#/GRCh38/'+ feature.id +'">' + feature.id + '</a>';
    return menu;
  }

}