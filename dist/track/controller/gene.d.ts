import Genoverse from './../../genoverse';
import TrackController from './../controller';
import TrackModel from './../model';
import TrackView from './../view';
import { GeneTrackProperties, Model, View } from './../../interfaces/gene';
export default abstract class GeneTrack extends TrackController {
    lengthDependentMV: [{
        minLength: number;
        labels: boolean;
        model: {
            class: Model;
        };
        view: {
            class: View;
            properties?: any;
        };
    }];
    viewProperties: Object;
    abstract populateMenu(feature: any): any;
    constructor(genoverse: Genoverse, properties: GeneTrackProperties);
    setEvents(): void;
    _getSettingsForLength(): {
        minLength: number;
        labels: boolean;
        model: {
            class: Model;
        };
        view: {
            class: View;
            properties?: any;
        };
    };
    createModel(): TrackModel;
    createView(properties: any): TrackView;
}
