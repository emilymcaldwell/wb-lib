export const AN_target     : string = "target";
export const AN_indicator  : string = "indicator";
export const AN_source     : string = "source";
export const AN_pursue     : string = "pursue";
export const AN_margin     : string = "margin";
export const AN_delay      : string = "delay";
export const AN_loiter     : string = "loiter";

import { $Assign, $Frozen, $Style, $Attr, $ElemEmplace, $ElemQuery, $ElemQueryAll, $ElemDocument } from "../utilities/index"
import { TippsVisor } from "./wb-tipps.visor";
export { TippsVisor };

export class Tipps extends HTMLElement
{
  static readonly QN: string = 'tipps';
  static readonly QR: ReadonlyArray<CustomElementConstructor & { QN:string }> = $Frozen([...TippsVisor.QR, Tipps]);

  static observedAttributes = $Frozen([AN_target, AN_indicator, AN_source, AN_pursue, AN_margin, AN_delay, AN_loiter]);

  #Visor: TippsVisor = new TippsVisor();

  #DocumentObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) =>
  {
    const targetSelector = this.#Target;
    for (const mutation of mutations)
    {
      if (mutation.target === this) return;
      else if (mutation.type === "childList")
      {
        // console.log({msg: "[DocumentObserver::onObservedMutation] Received ['childList'] mutation event"});
        mutation.removedNodes.forEach(rn => this.#updateEvents(rn, targetSelector, 1))
        mutation.addedNodes.forEach(an => this.#updateEvents(an, targetSelector));
      }
      else if (mutation.type === "attributes")
      {
        // console.log({msg: "[DocumentObserver::onObservedMutation] Received ['attributes'] mutation event"});
        // console.log({msg: "[DocumentObserver::onObservedMutation]   Attribute Changed", attr: mutation.attributeName});
        this.#updateEvents(mutation.target, targetSelector, 1);
        this.#updateEvents(mutation.target, targetSelector);
      }
    }
  });

  #onTippsUp = (ev: MouseEvent) => this.#Visor.onTippsUp(this, ev);
  #onTippsDown = (ev: MouseEvent) => this.#Visor.onTippsDown(this, ev);

  #updateEvents(node: Node, selector: string, remove: number = 0)
  {
    // console.log({msg: "[Tipps::updateEvents] Received request to update events", elem: node, isTargetted: ShouldUpdate});
    if (node instanceof HTMLElement && node.matches(selector))
    {
      const targetFn = (remove ? node.removeEventListener : node.addEventListener).bind(node);
      // console.log({msg: `[Tipps::updateEvents]   ${remove ? "Removing" : "Adding"} events`, elem: node});
      // targetFn.bind(node)("mouseover", this.#onTippsUp);
      // targetFn.bind(node)("mouseout", this.#onTippsDown);
      // targetFn.bind(node)("mousedown", this.#onTippsDown);
      // targetFn.bind(node)("click", this.#onTippsDown);
      targetFn("mouseover", this.#onTippsUp);
      // @ts-ignore
      ["mouseout", "mousedown", "click"].forEach(e => targetFn(e, this.#onTippsDown));
    }
  }

  get #Target() : string { return $Attr(this, AN_target) ?? '[title]'; }
  get #Indicator() : string { return $Attr(this, AN_indicator) ?? 'active'; }
  get Source() : string { return $Attr(this, AN_source) ?? 'title'; }
  get #Pursue() : boolean
  {
    if (!this.hasAttribute(AN_pursue)) return false;
    const value = $Attr(this, AN_pursue);
    if (!value) return true; // empty valued attribute
    return !(/^\s*(false|0|off)\s*$/i.test(value));
  }
  get #Margin()  : number { return Number($Attr(this, AN_margin) ?? 4); }
  get Delay()  : number { return Number($Attr(this, AN_delay) ?? 700); }
  get Loiter() : number { return Number($Attr(this, AN_loiter) ?? 300); }

  // set Target(v) { v ? this.setAttribute(AN_target, v) : this.removeAttribute(AN_target); }
  // set Indicator(v) { v ? this.setAttribute(AN_indicator, v) : this.removeAttribute(AN_indicator); }
  // set Source(v) { v ? this.setAttribute(AN_source, v) : this.removeAttribute(AN_source); }
  // set Pursue(v) { v ? this.setAttribute(AN_pursue, '') : this.removeAttribute(AN_pursue); }
  // set Margin(v)  { v ? this.setAttribute(AN_margin, String(v)) : this.removeAttribute(AN_margin); }
  // set Delay(v)  { v ? this.setAttribute(AN_delay, String(v)) : this.removeAttribute(AN_delay); }
  // set Loiter(v) { v ? this.setAttribute(AN_loiter, String(v)) : this.removeAttribute(AN_loiter); }

  connectedCallback()
  {
    // console.log({msg: "[Tipps::connectedCallback] Received connectedCallback request"});
    const baseNode = this.parentNode;
    if (baseNode)
    {
      const targetSelector = this.#Target;
      for (const existingNode of $ElemQueryAll(baseNode, targetSelector))
      {
        this.#updateEvents(existingNode, targetSelector, 1);
        this.#updateEvents(existingNode, targetSelector);
      }

      this.#DocumentObserver.disconnect();
      this.#DocumentObserver.observe(baseNode, {
        childList: true, subtree: true,
        // @ts-ignore
        attributeFilter: Tipps.observedAttributes
      });

      $ElemDocument(this).body.appendChild(this.#Visor).append(...this.children);
      this.#Visor.Pursue = this.#Pursue;
      this.#Visor.setIdr(this.#Indicator);
    }
  }

  attributeChangedCallback(name: any, oldValue: any, newValue: any): void
  {
    // console.log({msg: "[Tipps::attributeChangedCallback] Received Attribute changed notice", name: name});
    switch (name)
    {
      case AN_target: this.connectedCallback(); break
      case AN_pursue: this.#Visor.Pursue = this.#Pursue; break
      case AN_indicator: this.#Visor.setIdr(this.#Indicator); break
      case AN_margin: this.#Visor.Margin = this.#Margin; break
    }
  }
}