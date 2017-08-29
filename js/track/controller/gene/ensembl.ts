import Genoverse from './../../../genoverse';
import GeneTrack from './../gene';
import EnsemblGeneView from './../../view/gene/ensembl';
import EnsemblGeneModel from './../../model/gene/ensembl';
import EnsemblTranscriptView from './../../view/transcript/ensembl';
import EnsemblTranscriptModel from './../../model/transcript/ensembl';

import * as $ from 'jquery';

enum Bump {False, True, Label}

export default class EnsemblGeneTrack extends GeneTrack {

  constructor(genoverse: Genoverse) {
    super(genoverse, {
      name: 'Genes',
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
            properties: {label: true}
          }
        }
      ]
    });
  }

  init(): void {
    this.model = this.createModel();
    this.setDefaults();
    this.addDomElements();
    this.addUserEventHandlers();
    this.deferreds = []; // tracks deferreds so they can be stopped if the track is destroyed
    
    if (this.browser.scale) { // WHAT IS THIS!!!
      this.setScale();
      this.makeFirstImage();
    }
    this.view = this.createView();
    if (this.legend) {
      this.addLegend();
    }
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