export const AN_target     : string = "target";
export const AN_indicator  : string = "indicator";
export const AN_source     : string = "source";
export const AN_pursue     : string = "pursue";
export const AN_margin     : string = "margin";
export const AN_delay      : string = "delay";
export const AN_loiter     : string = "loiter";

export const EV_Click      : keyof DocumentEventMap = "click";
export const EV_MouseDown  : keyof DocumentEventMap = "mousedown";
export const EV_MouseMove  : keyof DocumentEventMap = "mousemove";
export const EV_MouseOut   : keyof DocumentEventMap = "mouseout";
export const EV_MouseOver  : keyof DocumentEventMap = "mouseover";

export const EV_TippsVisor : ReadonlyArray<keyof DocumentEventMap> = $Frozen([EV_MouseOver, EV_MouseOut, EV_MouseDown, EV_Click]);

import { DOMRect_FromView, $Frozen, $Assign, $Style, $Attr, $AttrAncestor, $ElemEmplace, $ElemQuery, $ElemQueryAll, $ElemQueryMatches, $ElemBounds, $ElemDocument, $ArrayHas, $MathMax, $MathMin, $TimeoutClear, $TimeoutSet } from "../utilities/index"

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

  #SlottedClassList = () => this.firstElementChild?.classList ?? null;

  constructor() {
    super();
    // this._internals = this.attachInternals();

    const ShadowRoot = this.attachShadow({mode: 'closed'});
    const ShadowDoc = $ElemDocument(ShadowRoot);

    const we = this.#WrapperElement = $ElemEmplace(ShadowDoc, ShadowRoot, "div");
    // $Assign(we.style, { position: "absolute", pointerEvents: "none" });
    $Style(we, { position: "absolute", pointerEvents: "none" });
    this.#setPosition(0,0);
    this.#SlotElement = $ElemEmplace(ShadowDoc, we, "slot");
  }

  // get #Target() : string { return $Attr(this, AN_target) ?? '[title]'; }
  get #Indicator() : string { return $Attr(this, AN_indicator) ?? 'active'; }
  get #Source() : string { return $Attr(this, AN_source) ?? 'title'; }
  get #Pursue() : boolean
  {
    if (!this.hasAttribute(AN_pursue)) return false;
    const value = $Attr(this, AN_pursue);
    if (!value) return true; // empty valued attribute
    return !(/^\s*(false|0|off)\s*$/i.test(value));
  }
  get #Margin()  : number { return (+($Attr(this, AN_margin) ?? 0) || 4); }
  get #Delay()  : number { return (+($Attr(this, AN_delay) ?? 0) || 700); }
  get #Loiter() : number { return (+($Attr(this, AN_loiter) ?? 0) || 300); }

  // Used by Tipps - Implies the attributes that must be synchronized to TippsVisor
  static observedAttributes = $Frozen([AN_target, AN_indicator, AN_source, AN_pursue, AN_margin, AN_delay, AN_loiter]);
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
    if (ev instanceof MouseEvent)
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
    (this.querySelector<HTMLSlotElement>('slot[name=prompt]') ?? this.#SlotElement).innerText = content ?? '';
  }

  #setPosition(pixelsX: number, pixelsY: number)
  {
    $Style(this.#WrapperElement, { left: pixelsX + 'px', top: pixelsY + 'px'});
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

    // Avoid underrun, deflect to right-side of cursor
    // let overrunFactor = DOMPoint.fromPoint({x: overrun.x / wrapperRect.width, y: overrun.y / wrapperRect.height});
    // position.x += (overrun.x ? overrun.x : (mouseRect.width * overrunFactor.y));
    position.x += (overrun.x ? overrun.x : (mouseRect.width * (overrun.y / wrapperRect.height)));
    position.y += overrun.y;

    // Absolutely prevent overrun (right, bottom)
    position.x = $MathMin(position.x, viewRect.right - wrapperRect.width);
    position.y = $MathMin(position.y, viewRect.bottom - wrapperRect.height);

    this.#setPosition(position.x, position.y);
  }

  #postDelay(ev: MouseEvent, element: HTMLElement)
  {
    this.#DelayHandle = void 0;
    this.#SlottedClassList()?.add(this.#Indicator);
    this.#WrapperElement.style.zIndex = element.style.zIndex ?? 0;
    this.#setContent($AttrAncestor(element, this.#Source));
    if (this.#Pursue)
    {
      this.#onMouseMove(ev);
      $ElemDocument(element).addEventListener(EV_MouseMove, this);
    }
    else
    {
      const elemRect = $ElemBounds(element);
      this.#setPosition(elemRect.right - this.#Margin, elemRect.bottom - this.#Margin);
    }
  }

  #onTippsUp(ev: MouseEvent)
  {
    const element = ev.target;
    if (!(element instanceof HTMLElement)) return;

    if (this.#LoiterHandle)
    {
      this.#LoiterHandle = $TimeoutClear(this.#LoiterHandle)!;
      this.#postDelay(ev, (this.#CurrentElement = element));
    }
    else
    {
      this.#CurrentElement = element;
      this.#DelayHandle = $TimeoutSet(() => this.#postDelay(ev, element), this.#Delay);
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

    $ElemDocument(this.#CurrentElement)?.removeEventListener(EV_MouseMove, this);
    // if (ev.type === "click" || ev.type === "mousedown") this.#postLoiter(tipps);
    // else this.#LoiterHandle = setTimeout(() => this.#postLoiter(tipps), tipps.Loiter);
    // if (ev.type === "click" || ev.type === "mousedown") this.#postLoiter();
    if (!ev || $ArrayHas([EV_Click, EV_MouseDown], ev.type)) this.#postLoiter();
    else this.#LoiterHandle = $TimeoutSet(() => this.#postLoiter(), this.#Loiter);
    this.#CurrentElement = null;
  }
}