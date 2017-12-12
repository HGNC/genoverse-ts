import TranscriptView from '../transcript';
export default class EnsemblTranscriptView extends TranscriptView {
    setFeatureColor(feature: {
        color: string;
        legend: string;
        labelColor: string;
        logic_name: string;
        biotype: string;
    }): void;
}
