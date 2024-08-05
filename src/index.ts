import { Tipps } from "./components/wb-tipps.js";
import { TumblrAudio } from "./components/wb-tmblr-audio.js";

const Registrations: Array<CustomElementConstructor & { QN:string }> =
[
  ...Tipps.QR,
  ...TumblrAudio.QR
];
Registrations.forEach(x => customElements.define(`wb-${x.QN}`, x));