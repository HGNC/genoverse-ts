Genoverse.Track.View.Gene.HGNCEnsembl = Genoverse.Track.View.Gene.extend({
  setFeatureColor: function (feature) {
    feature.color  = '#A00000';
    feature.legend = 'Ensembl gene';
    feature.labelColor = feature.color;
  }
});