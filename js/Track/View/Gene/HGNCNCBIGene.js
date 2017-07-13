Genoverse.Track.View.Gene.HGNCNCBIGene = Genoverse.Track.View.Gene.extend({
  setFeatureColor: function (feature) {
    feature.color  = '#000';
    feature.legend = 'NCBI gene';
    feature.labelColor = feature.color;
  }
});