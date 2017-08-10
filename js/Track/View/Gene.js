import TrackView from '../view';

enum Bump {False, True, Label}

export default abstract class GeneView extends TrackView {
  featureHeight = 5
  labels        = 'default';
  repeatLabels  = true;
  bump          = Bump.True;
}