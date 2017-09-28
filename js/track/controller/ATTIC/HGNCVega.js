Genoverse.Track.HGNCVega = Genoverse.Track.extend({
  id          : 'hgncVega',
  featureType : 'gene',
  height      : 100,
  legend      : false,
  // Different settings for different zoom level
  2000000: { // This one applies when > 2M base-pairs per screen
    labels : false
  },
  1: { // > 1 base-pair, but less then 2M
    labels : true,
    view   : Genoverse.Track.View.Gene.HGNCVega
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
    var url = 'http://vega.sanger.ac.uk/Homo_sapiens/Gene/Summary?db=core;g=' + feature.id;
    var sourceName = 'Vega gene: ';
    

    var menu = {
      title    : '<a target="_blank" href="' + url + '">' + sourceName + feature.id + '</a>',
      Location   : this.browser.chr + ':' + feature.start + '-' + feature.end,
      Source     : feature.source
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
});