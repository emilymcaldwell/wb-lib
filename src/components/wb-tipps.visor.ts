import { $ListenerAdd, $ListenerRemove, $IOfHTMLElement, $IOfHTMLAudioElement, $IOfMouseEvent, DOMRect_FromView, $Class, $Frozen, $Style, $Attr, $AttrAncestor, $ElemEmplace, $ElemQuery, $ElemBounds, $ElemDocument, $ArrayHas, $MathMax, $MathMin, $StrPixels, $TimeoutClear, $TimeoutSet } from "../utilities/index"
import { AN_target, AN_indicator, AN_source, AN_margin, AN_delay, AN_loiter } from "./common"
import { EV_Click, EV_MouseDown, EV_MouseMove, EV_MouseOut, EV_MouseOver  } from "./common"

export const EV_TippsVisor : ReadonlyArray<keyof DocumentEventMap> = $Frozen([EV_MouseOver, EV_MouseOut, EV_MouseDown, EV_Click]);

export class TippsVisor extends HTMLElement implements EventListenerObject
{
  static readonly QN: string = 'tipps-visor';
  static readonly QR: ReadonlyArray<CustomElementConstructor & { QN:string }> = $Frozen([TippsVisor]);

  // private _internals: ElementInternals;
  #WrapperElement: HTMLElement;
  #SlotElement: HTMLSlotElement;
  #CurrentElement: HTMLElement | null = null;
  #DelayHandle: number | undefined;
  #LoiterHandle: number | undefined;

  #SlottedClassList = () => $Class(this.firstElementChild);

  constructor() {
    super();
    // this._internals = this.attachInternals();

    const ShadowRoot = this.attachShadow({mode: 'closed'});
    const ShadowDoc = $ElemDocument(ShadowRoot);

    const wrapper = this.#WrapperElement = $ElemEmplace(ShadowDoc, ShadowRoot, "div");
    $Style(wrapper, { position: "absolute", pointerEvents: "none", zIndex: "-1" });
    this.#SlotElement = $ElemEmplace(ShadowDoc, wrapper, "slot");
  }

  // get #Target() : string { return $Attr(this, AN_target) ?? '[title]'; }
  get #Indicator() : string { return $Attr(this, AN_indicator) ?? 'active'; }
  get #Source() : string { return $Attr(this, AN_source) ?? 'title'; }
  get #Margin()  : number { return (+($Attr(this, AN_margin) ?? 0) || 4); }
  get #Delay()  : number { return (+($Attr(this, AN_delay) ?? 0) || 700); }
  get #Loiter() : number { return (+($Attr(this, AN_loiter) ?? 0) || 300); }

  // Used by Tipps - Implies the attributes that must be synchronized to TippsVisor
  // static observedAttributes = $Frozen([AN_target, AN_indicator, AN_source, AN_pursue, AN_margin, AN_delay, AN_loiter]);
  static observedAttributes = $Frozen([AN_target, AN_indicator, AN_source, AN_margin, AN_delay, AN_loiter]);
  attributeChangedCallback(name: string, oldValue: any, newValue: any)
  {
    if (name === AN_indicator)
    {
      const elemCL = this.#SlottedClassList();
      if (elemCL?.contains(oldValue))
      {
        elemCL.remove(oldValue);
        elemCL.add(newValue);
      }
    }
  }

  handleEvent(ev: Event): void
  {
    if ($IOfMouseEvent(ev))
    {
      if (ev.type === EV_MouseMove)
        this.#onMouseMove(ev);
      if (ev.type === EV_MouseOver)
        this.#onTippsUp(ev);
      else if ($ArrayHas([EV_MouseOut, EV_MouseDown, EV_Click], ev.type))
        this.onTippsDown(ev);
    }
  }

  #setContent(content: string | null = null)
  {
    ($ElemQuery<HTMLSlotElement>(this, 'slot[name=prompt]') ?? this.#SlotElement).innerText = content ?? '';
  }

  #onMouseMove = (ev: MouseEvent) =>
  {
    const targetView = $ElemDocument(this.#CurrentElement)?.defaultView;
    if (!targetView) return;

    const wrapperRect: DOMRect = $ElemBounds(this.#WrapperElement);

    // No API to get cursor size, assume roughly 32x32 (especially true for custom web cursors)
    const mouseRect: DOMRect = new DOMRect(ev.pageX, ev.pageY, 18, 18);

    // pixels of safety margin used when repositioning the visor
    // const windowRect: DOMRect = ElemRect.fromView(window);
    // const viewRect: DOMRect = ElemRect.shrink(windowRect, this.Margin);
    const viewRect: DOMRect = DOMRect_FromView(targetView, this.#Margin);

    // Our initial/desirable position is top-right of cursor
    const position = new DOMPoint(mouseRect.x, (mouseRect.y - wrapperRect.height));

    const overrun = new DOMPoint(
      $MathMax(0, (viewRect.left - position.x)) + $MathMin(0, (viewRect.right - (position.x + wrapperRect.width))),
      $MathMax(0, (viewRect.top - position.y)) + $MathMin(0, (viewRect.bottom - position.y))
    );

    // Avoid vertical overrun, deflect to right-side of cursor
    // let overrunFactor = DOMPoint.fromPoint({x: overrun.x / wrapperRect.width, y: overrun.y / wrapperRect.height});
    // position.x += (overrun.x ? overrun.x : (mouseRect.width * overrunFactor.y));
    position.x += (overrun.x ? overrun.x : (mouseRect.width * (overrun.y / wrapperRect.height)));
    position.y += overrun.y;

    // Absolutely prevent overrun (right, bottom)
    position.x = $MathMin(position.x, viewRect.right - wrapperRect.width);
    position.y = $MathMin(position.y, viewRect.bottom - wrapperRect.height);

    // Rounding errors in the browser may allow the tooltip to follow the cursor ~1 pixel outside the target element
    // This is not a code issue; The browser's interaction boundary for the element does not align with the visual/render boundary
    $Style(this.#WrapperElement, { left: $StrPixels(position.x), top: $StrPixels(position.y) });
  }

  #postDelay(ev: MouseEvent, element: HTMLElement)
  {
    this.#DelayHandle = void 0;
    this.#SlottedClassList()?.add(this.#Indicator);
    this.#WrapperElement.style.zIndex = element.style.zIndex ?? 0;
    this.#setContent($AttrAncestor(element, this.#Source));
    this.#onMouseMove(ev);
    $ListenerAdd($ElemDocument(element), EV_MouseMove, this);
  }

  #onTippsUp(ev: MouseEvent)
  {
    const element = ev.target;
    if ($IOfHTMLElement(element))
    {
      this.#CurrentElement = element
      if (this.#LoiterHandle)
      {
        this.#LoiterHandle = $TimeoutClear(this.#LoiterHandle)!;
        this.#postDelay(ev, element);
      }
      else this.#DelayHandle = $TimeoutSet(() => this.#postDelay(ev, element), this.#Delay);
    }
  }

  // #postLoiter(tipps: Tipps)
  #postLoiter()
  {
    this.#LoiterHandle = void 0;
    this.#setContent();
    this.#WrapperElement.style.zIndex = "-1";
    this.#SlottedClassList()?.remove(this.#Indicator);
  }

  onTippsDown(ev: MouseEvent | null | undefined)
  {
    this.#DelayHandle = $TimeoutClear(this.#DelayHandle)!;
    this.#LoiterHandle = $TimeoutClear(this.#LoiterHandle)!;

    $ListenerRemove($ElemDocument(this.#CurrentElement), EV_MouseMove, this);
    if (!ev || $ArrayHas([EV_Click, EV_MouseDown], ev.type)) this.#postLoiter();
    else this.#LoiterHandle = $TimeoutSet(() => this.#postLoiter(), this.#Loiter);
    this.#CurrentElement = null;
  }
}