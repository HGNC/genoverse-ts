export interface Band {
    id?: string;
    start: number;
    end: number;
    type?: string;
}
export interface Chromosome {
    size: number;
    bands: Band[];
}
export interface Chromosomes {
    [chrom: string]: Chromosome;
}
export default abstract class Genome {
    abstract chromosomes: Chromosomes;
}
