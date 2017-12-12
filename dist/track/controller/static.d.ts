/// <reference types="jquery" />
import Genoverse from './../../genoverse';
import TrackController from './../controller';
export default abstract class StaticTrack extends TrackController {
    stringified: string;
    image: JQuery<HTMLElement>;
    controls: string;
    resizable: boolean;
    constructor(genoverse: Genoverse, properties?: any);
    addDomElements(): void;
    reset(type?: string): void;
    setWidth(width: number): void;
    makeFirstImage(moveTo?: any): JQuery.Deferred<any, any, any>;
    makeImage(params: any): JQuery.Deferred<any, any, any>;
}
