Genoverse.Track.Model.Gene.HGNCPseudogeneOrg = Genoverse.Track.Model.Gene.extend({
  //url              : '/cgi-bin/genoverse/ajax/genes-by-coord?chr=__CHR__&start=__START__&end=__END__&source=Pseudogene.org',
  dataRequestLimit : 5000000, // As per e! REST API restrictions

  // The url above responds in json format, data is an array
  // We assume that parents always preceed children in data array, gene -> transcript -> exon
  // See rest.ensembl.org/documentation/info/feature_region for more details
  parseData: function (data) {
    for (var i = 0; i < data.length; i++) {
      var feature = data[i];

      if (feature.feature_type === 'gene' && !this.featuresById[feature.id]) {
        feature.label       = parseInt(feature.strand, 10) === 1 ? feature.id + ' >' : '< ' + feature.id;
        feature.transcripts = [];

        this.insertFeature(feature);
      }
    }
  }
});