/// <reference types="jquery" />

interface special {
  mousewheel: any
}

interface event {
  fixHooks: any;
  mouseHooks: any;
  special: special;
  fix(orgEvent: Event): Event;
  dispatch: any;
  handle: any;
}

interface JQueryStatic {
  event: event;
}