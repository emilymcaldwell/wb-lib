import { $ListenerAdd, $ListenerAddMany, $ListenerRemove, $ListenerRemoveMany, $IOfHTMLElement, $IOfHTMLAudioElement, $IOfMouseEvent, $Frozen, $Attr, $ClassRemove, $ClassToggle, $ElemQuerySelfAndAll, $ElemSelfAndAll, $ArrayHas } from "../utilities/index"
import { AN_target, AN_indicator, AN_simultaneous, EV_MouseDown, EV_MediaPause, EV_MediaPlay, EV_MediaEnded } from "./common"

export const EV_TumblrAudioEvents : ReadonlyArray<keyof DocumentEventMap> = $Frozen([EV_MediaPlay, EV_MediaPause, EV_MediaEnded]);
export const EV_TumblrAudioAttributes : ReadonlyArray<string> = $Frozen([AN_target, AN_indicator, AN_simultaneous]);

export class TumblrAudio extends HTMLElement implements EventListenerObject
{
  static readonly QN: string = 'tmblr-audio';
  static readonly QR: ReadonlyArray<CustomElementConstructor & { QN:string }> = $Frozen([TumblrAudio]);

  #State: WeakSet<HTMLElement> = new WeakSet();

  get #Indicator() : string { return $Attr(this, AN_indicator) ?? 'playing'; }
  get #Simultaneous() : boolean { return !!($Attr(this, AN_simultaneous)); }

  #DocumentObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) =>
  {
    for (const mutation of mutations)
    {
      let attr = mutation.attributeName;
      let target = mutation.target;
      if (target === this && attr)
      {
        // console.log({msg: "[DocumentObserver::onObservedMutation] Received mutation event for self", mutation: mutation});
        if ($ArrayHas(EV_TumblrAudioAttributes, attr))
          this.connectedCallback();
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
      // console.log({msg: "[TumblrAudio::removeEvents] Iterating hierarchy", list: $ElemSelfAndAll(elem)});
      for (const node of $ElemSelfAndAll(elem))
      {
        if ($IOfHTMLElement(node) && this.#State.delete(node))
        {
          $ListenerRemove(node, EV_MouseDown, this);
          $ListenerRemoveMany(node, EV_TumblrAudioEvents, this);
          $ClassRemove(node, this.#Indicator);
        }
      }
    }
  }

  #affix(elem: Node)
  {
    const selector = $Attr(this, AN_target);
    if (selector && $IOfHTMLElement(elem))
    {
      // console.log({msg: "[TumblrAudio::addEvents] Iterating hierarchy", list: $ElemQuerySelfAndAll(elem, selector)});
      for (const node of $ElemQuerySelfAndAll(elem, selector))
      {
        if ($IOfHTMLElement(node) && !this.#State.has(node))
        {
          const sibling = node.nextElementSibling;
          if ($IOfHTMLAudioElement(sibling))
          {
            $ClassToggle(node, this.#Indicator, !sibling.paused);
          }
          $ListenerAdd(node, EV_MouseDown, this);
          this.#State.add(node);
        }
      }
    }
  }

  handleEvent(ev: Event): void
  {
    // console.log({msg: "[TumblrAudio::handleEvent] Received event", ev: ev});
    const element = ev.target;
    if ($IOfMouseEvent(ev))
    { // Play/Pause clicked... 'element' should be an element that matched AN_target parameter
      if ($IOfHTMLElement(element))
      {
        const sibling = element.nextElementSibling;
        if ($IOfHTMLAudioElement(sibling))
        {
          // console.log({msg: "[TumblrAudio::handleEvent] Trigger Play/Pause"});
          if (!this.#State.has(sibling))
          {
            $ListenerAddMany(sibling, EV_TumblrAudioEvents, this);
            this.#State.add(sibling);
          }
          if (sibling.paused)
          {
            if (!this.#Simultaneous)
            {
              const baseNode = this.parentElement;
              if (baseNode)
              {
                $ElemQuerySelfAndAll(baseNode, "audio").forEach(el => el.pause())
              }
            }
            sibling.play();
          }
          else sibling.pause();
        }
      }
    }
    else if ($ArrayHas(EV_TumblrAudioEvents, ev.type))
    { // Media state changed... 'element' should be the audio element
      if ($IOfHTMLAudioElement(element))
      {
        $ClassToggle(element.previousElementSibling, this.#Indicator, !element.paused);
      }
    }
  }

  connectedCallback()
  {
    // console.log({msg: "[TumblrAudio::connectedCallback] Received connectedCallback request"});
    const baseNode = this.parentNode;
    if (baseNode)
    {
      this.#excise(baseNode);
      this.#affix(baseNode);

      this.#DocumentObserver.disconnect();
      this.#DocumentObserver.observe(baseNode, {
        childList: true, subtree: true,
        // @ts-expect-error -- ReadOnlyArray vs. Array
        attributeFilter: EV_TumblrAudioAttributes
      });
    }
  }
}