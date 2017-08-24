Genoverse.Track.View.Gene.HGNCPseudogeneOrg = Genoverse.Track.View.Gene.extend({
  setFeatureColor: function (feature) {
    feature.color  = '#FC6707';
    feature.legend = 'Pseudogene.org';
    feature.labelColor = feature.color;
  }
});