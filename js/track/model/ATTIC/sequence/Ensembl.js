import SequenceModel from './../sequence';

export default class EnsemblSequenceModel extends SequenceModel {
  url              = '//rest.ensembl.org/sequence/region/human/__CHR__:__START__-__END__?content-type=text/plain';
  dataRequestLimit = 10000000; // As per e! REST API restrictions
}
