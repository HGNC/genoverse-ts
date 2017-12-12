import GeneView from './../gene';
export default class HgncVegaGeneView extends GeneView {
    setFeatureColor(feature: {
        color: string;
        legend: string;
        labelColor: string;
        logic_name: string;
        biotype: string;
    }): void;
}
