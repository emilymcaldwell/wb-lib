export const AN_target              : string = "target";
export const AN_indicator           : string = "indicator";
export const AN_source              : string = "source";
export const AN_margin              : string = "margin";
export const AN_delay               : string = "delay";
export const AN_loiter              : string = "loiter";
/** wide names for wide choices */
export const AN_simultaneous        : string = "simultaneous-playback";

export const EV_Click               : keyof DocumentEventMap = "click";
export const EV_MouseDown           : keyof DocumentEventMap = "mousedown";
export const EV_MouseMove           : keyof DocumentEventMap = "mousemove";
export const EV_MouseOut            : keyof DocumentEventMap = "mouseout";
export const EV_MouseOver           : keyof DocumentEventMap = "mouseover";

export const EV_MediaLoadStarted    : keyof DocumentEventMap = "loadstart";
/** Media buffering has successfully prepared further data */
export const EV_MediaLoadProgressed : keyof DocumentEventMap = "progress";
/** Media buffering has been temporarily suspended/paused until more data is necessary */
export const EV_MediaLoadSuspended  : keyof DocumentEventMap = "suspend";
export const EV_MediaLoadedData     : keyof DocumentEventMap = "loadeddata";
export const EV_MediaLoadedMeta     : keyof DocumentEventMap = "loadedmetadata";
export const EV_MediaCanWait        : keyof DocumentEventMap = "canplay";
export const EV_MediaCanPlay        : keyof DocumentEventMap = "canplaythrough";
export const EV_MediaVolume         : keyof DocumentEventMap = "volumechange";
export const EV_MediaPlay           : keyof DocumentEventMap = "play";
export const EV_MediaResuming       : keyof DocumentEventMap = "playing";
/** Occurs whenever the play head has been moved by the mouse; If occuring during playback, a 'pause' event comes prior, and 'play' event comes afterwards. */
export const EV_MediaSeek           : keyof DocumentEventMap = "seeking";
export const EV_MediaSeeked         : keyof DocumentEventMap = "seeked";
export const EV_MediaPlayProgressed : keyof DocumentEventMap = "timeupdate";
/** Occurs whenever media playback is paused. */
export const EV_MediaPause          : keyof DocumentEventMap = "pause";
export const EV_MediaWaiting        : keyof DocumentEventMap = "waiting";
export const EV_MediaStalled        : keyof DocumentEventMap = "stalled";
/** Occurs when the play head attempts to advance past the end of the media; If occuring during playback, a 'pause' event comes prior. */
export const EV_MediaEnded          : keyof DocumentEventMap = "ended";
