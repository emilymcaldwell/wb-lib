import { $Frozen, $Attr, $AttrUpdate, $ElemQuerySelfAndAll, $ElemSelfAndAll, $ElemDocument, $ArrayHas } from "../utilities/index"
import { AN_target, TippsVisor, EV_TippsVisor } from "./wb-tipps.visor";
export { TippsVisor };

const VisorAttributes = TippsVisor.observedAttributes;

export class Tipps extends HTMLElement
{
  static readonly QN: string = 'tipps';
  static readonly QR: ReadonlyArray<CustomElementConstructor & { QN:string }> = $Frozen([...TippsVisor.QR, Tipps]);

  #State: WeakSet<HTMLElement> = new WeakSet();
  #Visor: TippsVisor = new TippsVisor();

  #DocumentObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) =>
  {
    for (const mutation of mutations)
    {
      let attr = mutation.attributeName;
      let target = mutation.target;
      if (target === this && attr)
      {
        // console.log({msg: "[DocumentObserver::onObservedMutation] Received mutation event for self", mutation: mutation});
        if (attr === AN_target)
          this.connectedCallback();
        else if ($ArrayHas(VisorAttributes, attr))
          $AttrUpdate(this.#Visor, attr, $Attr(this, attr));
      }
      else if (mutation.type === "childList")
      {
        // console.log({msg: "[DocumentObserver::onObservedMutation] Received ['childList'] mutation event"});
        mutation.removedNodes.forEach(rn => this.#excise(rn))
        mutation.addedNodes.forEach(an => this.#affix(an));
      }
      else if (mutation.type === "attributes")
      {
        // console.log({msg: "[DocumentObserver::onObservedMutation] Received ['attributes'] mutation event"});
        // console.log({msg: "[DocumentObserver::onObservedMutation]   Attribute Changed", attr: attr});
        this.#excise(target);
        this.#affix(target);
      }
    }
  });

  #excise(elem: Node)
  {
    if (elem instanceof HTMLElement)
    {
      // let list = [elem, ...elem.querySelectorAll('*')];
      // console.log({msg: "[Tipps::removeEvents] Iterating hierarchy", list: list});
      // for (const node of list)
      for (const node of $ElemSelfAndAll(elem))
      {
        if (node instanceof HTMLElement && this.#State.delete(node))
        {
          EV_TippsVisor.forEach(e => node.removeEventListener(e, this.#Visor));
        }
      }
    }
  }

  #affix(elem: Node)
  {
    const selector = $Attr(this, AN_target);
    if (selector && elem instanceof HTMLElement)
    {
      // let list = [...(elem.matches(selector) ? [elem] : []) , ...elem.querySelectorAll(selector)];
      // console.log({msg: "[Tipps::addEvents] Iterating hierarchy", list: list});
      // for (const node of list)
      for (const node of $ElemQuerySelfAndAll(elem, selector))
      {
        if (node instanceof HTMLElement && !this.#State.has(node))
        {
          this.#State.add(node);
          EV_TippsVisor.forEach(e => node.addEventListener(e, this.#Visor));
        }
      }
    }
  }


  connectedCallback()
  {
    // console.log({msg: "[Tipps::connectedCallback] Received connectedCallback request"});
    const baseNode = this.parentNode;
    if (baseNode)
    {
      VisorAttributes.forEach(attr => $AttrUpdate(this.#Visor, attr, $Attr(this, attr)));

      this.#Visor.onTippsDown(null);
      this.#excise(baseNode);
      this.#affix(baseNode);

      this.#DocumentObserver.disconnect();
      this.#DocumentObserver.observe(baseNode, {
        childList: true, subtree: true,
        // @ts-expect-error -- ReadOnlyArray vs. Array
        attributeFilter: VisorAttributes
      });

      $ElemDocument(this).body.appendChild(this.#Visor).append(...this.children);
    }
  }
}