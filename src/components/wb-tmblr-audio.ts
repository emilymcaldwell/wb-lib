import { $ListenerAdd, $ListenerAddMany, $ListenerRemove, $ListenerRemoveMany } from "../utilities/index"
import { $IOfHTMLElement, $AsHTMLAudioElement, $IOfHTMLAudioElement, $IOfMouseEvent } from "../utilities/index"
import { $Frozen, $Attr, $ClassRemove, $ClassToggle, $ElemQuerySelfAndAll, $ElemQuery, $ElemParent, $ElemNextSibling, $ElemPrevSibling, $ElemSelfAndAll, $ArrayHas, $Style, $MutationObserver_Tri } from "../utilities/index"
import { AN_target, AN_indicator, AN_simultaneous, EV_MouseDown, EV_MediaPause, EV_MediaPlay, EV_MediaEnded } from "./common"

export const EV_TumblrAudioEvents : ReadonlyArray<keyof DocumentEventMap> = $Frozen([EV_MediaPlay, EV_MediaPause, EV_MediaEnded]);
export const EV_TumblrAudioAttributes : ReadonlyArray<string> = $Frozen([AN_target, AN_indicator, AN_simultaneous]);

export class TumblrAudio extends HTMLElement implements EventListenerObject
{
  static readonly QN: string = 'tmblr-audio';
  static readonly QR: ReadonlyArray<CustomElementConstructor & { QN:string }> = $Frozen([TumblrAudio]);

  #State: WeakMap<HTMLElement, string> = new WeakMap();

  get #Indicator() : string { return $Attr(this, AN_indicator) ?? 'playing'; }
  get #Simultaneous() : boolean { return !!($Attr(this, AN_simultaneous)); }

  #DocumentObserver: MutationObserver = $MutationObserver_Tri(
    (target, attr) =>
    {
      if (target === this && $ArrayHas(EV_TumblrAudioAttributes, attr))
        this.connectedCallback();
      else (this.#excise(target), this.#affix(target));
    },
    (addedNode) => this.#affix(addedNode),
    (removedNode) => this.#affix(removedNode)
    );

  #excise(elem: Node)
  {
    if ($IOfHTMLElement(elem))
    {
      // console.log({msg: "[TumblrAudio::removeEvents] Iterating hierarchy", list: $ElemSelfAndAll(elem)});
      for (const node of $ElemSelfAndAll(elem))
      {
        const origBg = this.#State.get(node);
        if (this.#State.delete(node))
        {
          $ListenerRemove(node, EV_MouseDown, this);
          $ListenerRemoveMany(node, EV_TumblrAudioEvents, this);
          $ClassRemove(node, this.#Indicator);
          if (!$IOfHTMLAudioElement(node))
          {
            $Style($ElemParent(node), { backgroundImage: origBg });
          }
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
          const parent = $ElemParent(node);
          if (parent)
          {
            $ListenerAdd(node, EV_MouseDown, this);
            $ClassToggle(node, this.#Indicator, !($AsHTMLAudioElement($ElemNextSibling(node))?.paused ?? true));
            this.#State.set(node, $Style(parent)?.backgroundImage ?? "");
            $Style(parent, { backgroundImage: `url(${$ElemQuery(node, "img")?.src})` });
          }
        }
      }
    }
  }

  // Receives both the clickable play/pause events, as well as the Audio element'ss playback events
  handleEvent(ev: Event): void
  {
    // console.log({msg: "[TumblrAudio::handleEvent] Received event", ev: ev});
    const element = ev.target;
    if ($IOfMouseEvent(ev) && $IOfHTMLElement(element))
    { // Play/Pause clicked... 'element' should be an element that matched AN_target parameter
      const sibling = $ElemNextSibling(element);
      if ($IOfHTMLAudioElement(sibling))
      {
        // console.log({msg: "[TumblrAudio::handleEvent] Trigger Play/Pause"});
        if (!this.#State.has(sibling))
        {
          $ListenerAddMany(sibling, EV_TumblrAudioEvents, this);
          this.#State.set(sibling, "");
        }
        if (sibling.paused)
        {
          if (!this.#Simultaneous)
          {
            const baseElement = $ElemParent(this);
            if (baseElement)
            {
              $ElemQuerySelfAndAll(baseElement, "audio").forEach(el => el.pause())
            }
          }
          sibling.play();
        }
        else sibling.pause();
      }
    }
    else if ($ArrayHas(EV_TumblrAudioEvents, ev.type) && $IOfHTMLAudioElement(element))
    { // Media state changed... 'element' should be the audio element
      $ClassToggle($ElemPrevSibling(element), this.#Indicator, !element.paused);
    }
  }

  connectedCallback()
  {
    // console.log({msg: "[TumblrAudio::connectedCallback] Received connectedCallback request"});
    const baseElement = $ElemParent(this);
    if (baseElement)
    {
      this.#excise(baseElement);
      this.#affix(baseElement);

      this.#DocumentObserver.disconnect();
      this.#DocumentObserver.observe(baseElement, {
        childList: true, subtree: true,
        // @ts-expect-error -- ReadOnlyArray vs. Array
        attributeFilter: EV_TumblrAudioAttributes
      });
    }
  }
}