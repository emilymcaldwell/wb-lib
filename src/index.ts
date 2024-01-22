import { Tipps } from "./components/wb-tipps.js";

const Registrations: Array<CustomElementConstructor & { QN:string }> =
[
  ...Tipps.QR
];
Registrations.forEach(x => customElements.define(`wb-${x.QN}`, x));