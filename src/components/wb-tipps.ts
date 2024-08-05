import { $ListenerAddMany, $ListenerRemoveMany, $IOfHTMLElement, $Frozen, $Attr, $AttrUpdate, $ElemQuerySelfAndAll, $ElemSelfAndAll, $ElemDocument, $ArrayHas } from "../utilities/index"
import { AN_target } from "./common"
import { TippsVisor, EV_TippsVisor } from "./wb-tipps.visor";
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
    if ($IOfHTMLElement(elem))
    {
      // console.log({msg: "[Tipps::removeEvents] Iterating hierarchy", list: [elem, ...elem.querySelectorAll('*')]});
      for (const node of $ElemSelfAndAll(elem))
      {
        if ($IOfHTMLElement(node) && this.#State.delete(node))
        {
          $ListenerRemoveMany(node, EV_TippsVisor, this.#Visor);
        }
      }
    }
  }

  #affix(elem: Node)
  {
    const selector = $Attr(this, AN_target);
    if (selector && $IOfHTMLElement(elem))
    {
      // console.log({msg: "[Tipps::addEvents] Iterating hierarchy", list: [...(elem.matches(selector) ? [elem] : []) , ...elem.querySelectorAll(selector)]});
      for (const node of $ElemQuerySelfAndAll(elem, selector))
      {
        if ($IOfHTMLElement(node) && !this.#State.has(node))
        {
          this.#State.add(node);
          $ListenerAddMany(node, EV_TippsVisor, this.#Visor);
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