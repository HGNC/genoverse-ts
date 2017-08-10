/// <reference types="jquery" />

interface JQueryStatic {
  metadata: any;
}

type tipsyOptions = {
    className?: number,
    delayIn?: number,
    delayOut?: number,
    fade?: boolean,
    fallback?: string,
    gravity?: string,
    html?: boolean,
    live?: boolean,
    offset?: number,
    opacity?: number,
    title?: string,
    trigger?: string
};

interface JQuery {
  tipsy(options: any): JQuery<HTMLElement>;
  tipsyDefaults: tipsyOptions;
  tipsyElementOptions(ele, options): any;
  tipsyRevalidate(): void;
  metadata(): any;
  tipsyAutoNS(): string;
  tipsyAutoWE(): string;
  tipsyAutoBounds(margin: number, prefer: string): Function;
}