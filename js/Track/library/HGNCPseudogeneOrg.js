Genoverse.Track.HGNCPseudogeneOrg = Genoverse.Track.extend({
  id          : 'hgncPseudogeneOrg',
  featureType : 'gene',
  height      : 100,
  legend      : false,
  // Different settings for different zoom level
  2000000: { // This one applies when > 2M base-pairs per screen
    labels : false
  },
  1: { // > 1 base-pair, but less then 2M
    labels : true,
    view   : Genoverse.Track.View.Gene.HGNCPseudogeneOrg
  },

  constructor: function () {
    this.base.apply(this, arguments);

    if (this.legend === true) {
      this.type = this.id;
      this.browser.addTrack(Genoverse.Track.Legend.extend({
        id          : this.id   + 'Legend',
        name        : this.name + ' Legend',
        featureType : this.type
      }), this.order + 0.1);
    }
  },

  populateMenu: function (feature) {
    var url = 'http://tables.pseudogene.org/' + feature.id;
    var sourceName = 'Pseudogene.org: ';

    var menu = {
      title    : '<a target="_blank" href="' + url + '">' + sourceName + feature.id + '</a>',
      Location   : this.browser.chr + ':' + feature.start + '-' + feature.end,
      Source     : feature.source
    };
    if(feature.parent_gene){
      var ensURL = 'http://www.ensembl.org/Homo_sapiens/Gene/Summary?g=' + feature.parent_gene;
      menu['Parent gene'] = '<a target="_blank" href="' + ensURL + '">' + feature.parent_gene + '</a>';
      menu['E-value'] = feature.evalue;
      menu['Identity'] = feature.identity;
      menu['Class'] = feature.class;
    }
    menu['Rerun as'] = '<a href="/update/mapping.html#/GRCh38/'+ feature.id +'">' + feature.id + '</a>';
    return menu;
  }
});