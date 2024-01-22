import { DOMRect_FromView } from "../utilities/index"
import { Tipps } from "./wb-tipps";

export class TippsVisor extends HTMLElement
{
  static readonly QN: string = 'tipps-visor';
  static readonly QR: ReadonlyArray<CustomElementConstructor & { QN:string }> = Object.freeze([TippsVisor]);

  Pursue: boolean = true;
  Margin: number = 4;

  // private _internals: ElementInternals;
  // private ShadowRoot: ShadowRoot;
  #WrapperElement: HTMLElement;
  #SlotElement: HTMLSlotElement;

  #Indicator: string = '';

  #CurrentElement: HTMLElement | null = null;
  #DelayHandle: number | undefined;
  #LoiterHandle: number | undefined;

  get #SlottedCL(): DOMTokenList | null
  {
    return this.firstElementChild?.classList ?? null;
  }

  constructor() {
    super();

    // this._internals = this.attachInternals();
    // this.ShadowRoot = this.attachShadow({mode: 'closed'});
    let ShadowRoot = this.attachShadow({mode: 'closed'});
    let ShadowDoc = ShadowRoot.ownerDocument;

    let we = this.#WrapperElement = ShadowRoot.appendChild(ShadowDoc.createElement("div"));
    we.style.position = "absolute";
    we.style.pointerEvents = "none";

    this.#SlotElement = we.appendChild(ShadowDoc.createElement("slot"));
  }

  // connectedCallback() { }

  updateIndicator(newIndicator: string)
  {
    // console.log({msg: "[TippsVisor::updateIndicator] Received Indicator update request"});
    const elemCL = this.#SlottedCL;
    if (elemCL?.contains(this.#Indicator))
    {
      elemCL.remove(this.#Indicator);
      elemCL.add(newIndicator);
    }
    this.#Indicator = newIndicator;
  }

  #setContent(content: string | null = null)
  {
    (this.querySelector<HTMLSlotElement>('slot[name=prompt]') ?? this.#SlotElement).innerText = content ?? '';
  }

  #setPosition(pixelsX: number, pixelsY: number)
  {
    // console.info({msg: '[TippsVisor::setPosition] Updating position', x: this.AccumX, y: this.AccumY});
    const WrapperStyle = this.#WrapperElement.style;
    // WrapperStyle.left = `${Number.isNaN(pixelsX) ? 0 : pixelsX}px`;
    // WrapperStyle.top = `${Number.isNaN(pixelsY) ? 0 : pixelsY}px`;
    WrapperStyle.left = pixelsX + 'px';
    WrapperStyle.top = pixelsY + 'px';
  }

  #onMouseMove = (ev: MouseEvent) =>
  {
    const targetView = this.#CurrentElement?.ownerDocument?.defaultView;
    if (!targetView) return;

    // const targetRect = this.CurrentTarget!.getBoundingClientRect();
    const wrapperRect: DOMRect = this.#WrapperElement.getBoundingClientRect();

    // No API to get cursor size, assume roughly 32x32 (especially true for custom web cursors)
    const mouseRect: DOMRect = new DOMRect(ev.pageX, ev.pageY, 18, 18);

    // pixels of safety margin used when repositioning the visor
    // const windowRect: DOMRect = ElemRect.fromView(window);
    // const viewRect: DOMRect = ElemRect.shrink(windowRect, this.Margin);
    const viewRect: DOMRect = DOMRect_FromView(targetView, this.Margin);

    // Our initial/desirable position is top-right of cursor
    let position = new DOMPoint(mouseRect.x, (mouseRect.y - wrapperRect.height));

    let overrun = new DOMPoint(
      Math.max(0, (viewRect.left - position.x)) + Math.min(0, (viewRect.right - (position.x + wrapperRect.width))),
      Math.max(0, (viewRect.top - position.y)) + Math.min(0, (viewRect.bottom - position.y))
    );

    // Avoid underrun, deflect to right-side of cursor
    // let overrunFactor = DOMPoint.fromPoint({x: overrun.x / wrapperRect.width, y: overrun.y / wrapperRect.height});
    // position.x += (overrun.x ? overrun.x : (mouseRect.width * overrunFactor.y));
    position.x += (overrun.x ? overrun.x : (mouseRect.width * (overrun.y / wrapperRect.height)));
    position.y += overrun.y;

    // Absolutely prevent overrun (right, bottom)
    position.x = Math.min(position.x, viewRect.right - wrapperRect.width);
    position.y = Math.min(position.y, viewRect.bottom - wrapperRect.height);

    this.#setPosition(position.x, position.y);
  }

  #postDelay(tipps: Tipps, ev: MouseEvent, element: HTMLElement)
  {
    this.#DelayHandle = void 0;
    this.#SlottedCL?.add(this.#Indicator);
    this.#WrapperElement.style.zIndex = element.style.zIndex ?? "0";
    this.#setContent(element.getAttribute(tipps.Source));
    if (this.Pursue)
    {
      this.#onMouseMove(ev);
      element.ownerDocument.addEventListener("mousemove", this.#onMouseMove);
    }
    else
    {
      // const enroachment = 0.28;
      // const elemRect = element.getBoundingClientRect();
      // const pixelsX = (elemRect.right - (elemRect.width * enroachment));
      // const pixelsY = (elemRect.bottom - (elemRect.height * enroachment));
      // this.setPosition(pixelsX, pixelsY);
      const elemRect = element.getBoundingClientRect();
      this.#setPosition(elemRect.right - this.Margin, elemRect.bottom - this.Margin);
    }
  }

  onTippsUp(tipps: Tipps, ev: MouseEvent)
  {
    const element = ev.target;
    if (!(element instanceof HTMLElement)) return;

    if (this.#LoiterHandle)
    {
      this.#LoiterHandle = clearTimeout(this.#LoiterHandle)!;
      this.#postDelay(tipps, ev, (this.#CurrentElement = element));
    }
    else
    {
      this.#CurrentElement = element;
      this.#DelayHandle = setTimeout(() => this.#postDelay(tipps, ev, element), tipps.Delay);
    }
  }



  // #postLoiter(tipps: Tipps)
  #postLoiter()
  {
    this.#LoiterHandle = void 0;
    this.#setContent();
    this.#WrapperElement.style.zIndex = "-1";
    this.#SlottedCL?.remove(this.#Indicator);
  }

  onTippsDown(tipps: Tipps, ev: MouseEvent)
  {
    this.#DelayHandle = clearTimeout(this.#DelayHandle)!;
    this.#LoiterHandle = clearTimeout(this.#LoiterHandle)!;

    this.#CurrentElement?.ownerDocument.removeEventListener("mousemove", this.#onMouseMove);
    // if (ev.type === "click" || ev.type === "mousedown") this.#postLoiter(tipps);
    // else this.#LoiterHandle = setTimeout(() => this.#postLoiter(tipps), tipps.Loiter);
    if (ev.type === "click" || ev.type === "mousedown") this.#postLoiter();
    else this.#LoiterHandle = setTimeout(() => this.#postLoiter(), tipps.Loiter);
    this.#CurrentElement = null;
  }
}