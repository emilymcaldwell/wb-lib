/*! wb-lib | https://github.com/emilymcaldwell/wb-lib/blob/main/LICENSE */
function DOMRect_FromView(view, margin) {
    const margin2 = margin * 2;
    return new DOMRect(view.scrollX + margin, view.scrollY + margin, view.innerWidth - margin2, view.innerHeight - margin2);
}

const $Assign = Object.assign;
const $Frozen = Object.freeze;
const $MathMax = Math.max;
const $MathMin = Math.min;
const $TimeoutClear = clearTimeout;
const $TimeoutSet = setTimeout;
const $Style = (elem, obj) => $Assign(elem.style, obj);
const $StrPixels = (px) => px + 'px';
const $Class = ((elem) => elem?.classList ?? null);
const $ClassToggle = ((elem, className, force) => $Class(elem)?.toggle(className, force) ?? null);
const $ClassRemove = ((elem, className) => $ClassToggle(elem, className, false) ?? null);
const $Attr = (elem, attr) => elem?.getAttribute(attr) ?? null;
const $AttrAncestor = (elem, attr) => $Attr(((attrQuery) => elem?.matches(attrQuery) ? elem : elem?.closest(attrQuery))(`[${attr}]`), attr);
const $AttrUpdate = (elem, attr, value) => attr && (value ? elem?.setAttribute(attr, value) : elem?.removeAttribute(attr));
const $ElemEmplace = (document, parent, tagName, options) => parent.appendChild(document.createElement(tagName, options));
const $ElemQueryAll = ((elem, query) => elem.querySelectorAll(query));
const $ElemQueryMatches = ((elem, query) => elem.matches(query));
const $ElemQuerySelfAndAll = ((elem, query) => [...($ElemQueryMatches(elem, query) ? [elem] : []), ...$ElemQueryAll(elem, query)]);
const $ElemSelfAndAll = ((elem) => [...[elem], ...$ElemQueryAll(elem, '*')]);
const $ElemBounds = ((elem) => elem?.getBoundingClientRect());
const $ElemDocument = ((elem) => elem?.ownerDocument);
const $ArrayHas = ((arr, searchElement) => arr?.includes(searchElement) ?? false);
const $ListenerAdd = ((elem, type, listener) => elem?.addEventListener(type, listener));
const $ListenerRemove = ((elem, type, listener) => elem?.removeEventListener(type, listener));
const $ListenerAddMany = ((elem, types, listener) => types.forEach(x => $ListenerAdd(elem, x, listener)));
const $ListenerRemoveMany = ((elem, types, listener) => types.forEach(x => $ListenerRemove(elem, x, listener)));
const $IOfHTMLElement = (elem) => elem instanceof HTMLElement;
const $IOfHTMLAudioElement = (elem) => elem instanceof HTMLAudioElement;
const $IOfMouseEvent = (ev) => ev instanceof MouseEvent;

const AN_target = "target";
const AN_indicator = "indicator";
const AN_source = "source";
const AN_margin = "margin";
const AN_delay = "delay";
const AN_loiter = "loiter";
const AN_simultaneous = "simultaneous-playback";
const EV_Click = "click";
const EV_MouseDown = "mousedown";
const EV_MouseMove = "mousemove";
const EV_MouseOut = "mouseout";
const EV_MouseOver = "mouseover";
const EV_MediaPlay = "play";
const EV_MediaPause = "pause";
const EV_MediaEnded = "ended";

const EV_TippsVisor = $Frozen([EV_MouseOver, EV_MouseOut, EV_MouseDown, EV_Click]);
class TippsVisor extends HTMLElement {
    static QN = 'tipps-visor';
    static QR = $Frozen([TippsVisor]);
    #WrapperElement;
    #SlotElement;
    #CurrentElement = null;
    #DelayHandle;
    #LoiterHandle;
    #SlottedClassList = () => $Class(this.firstElementChild);
    constructor() {
        super();
        const ShadowRoot = this.attachShadow({ mode: 'closed' });
        const ShadowDoc = $ElemDocument(ShadowRoot);
        const wrapper = this.#WrapperElement = $ElemEmplace(ShadowDoc, ShadowRoot, "div");
        $Style(wrapper, { position: "absolute", pointerEvents: "none" });
        this.#setPosition(0, 0);
        this.#SlotElement = $ElemEmplace(ShadowDoc, wrapper, "slot");
    }
    get #Indicator() { return $Attr(this, AN_indicator) ?? 'active'; }
    get #Source() { return $Attr(this, AN_source) ?? 'title'; }
    get #Margin() { return (+($Attr(this, AN_margin) ?? 0) || 4); }
    get #Delay() { return (+($Attr(this, AN_delay) ?? 0) || 700); }
    get #Loiter() { return (+($Attr(this, AN_loiter) ?? 0) || 300); }
    static observedAttributes = $Frozen([AN_target, AN_indicator, AN_source, AN_margin, AN_delay, AN_loiter]);
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === AN_indicator) {
            const elemCL = this.#SlottedClassList();
            if (elemCL?.contains(oldValue)) {
                elemCL.remove(oldValue);
                elemCL.add(newValue);
            }
        }
    }
    handleEvent(ev) {
        if ($IOfMouseEvent(ev)) {
            if (ev.type === EV_MouseMove)
                this.#onMouseMove(ev);
            if (ev.type === EV_MouseOver)
                this.#onTippsUp(ev);
            else if ($ArrayHas([EV_MouseOut, EV_MouseDown, EV_Click], ev.type))
                this.onTippsDown(ev);
        }
    }
    #setContent(content = null) {
        (this.querySelector('slot[name=prompt]') ?? this.#SlotElement).innerText = content ?? '';
    }
    #setPosition(pixelsX, pixelsY) {
        $Style(this.#WrapperElement, { left: $StrPixels(pixelsX), top: $StrPixels(pixelsY) });
    }
    #onMouseMove = (ev) => {
        const targetView = $ElemDocument(this.#CurrentElement)?.defaultView;
        if (!targetView)
            return;
        const wrapperRect = $ElemBounds(this.#WrapperElement);
        const mouseRect = new DOMRect(ev.pageX, ev.pageY, 18, 18);
        const viewRect = DOMRect_FromView(targetView, this.#Margin);
        const position = new DOMPoint(mouseRect.x, (mouseRect.y - wrapperRect.height));
        const overrun = new DOMPoint($MathMax(0, (viewRect.left - position.x)) + $MathMin(0, (viewRect.right - (position.x + wrapperRect.width))), $MathMax(0, (viewRect.top - position.y)) + $MathMin(0, (viewRect.bottom - position.y)));
        position.x += (overrun.x ? overrun.x : (mouseRect.width * (overrun.y / wrapperRect.height)));
        position.y += overrun.y;
        position.x = $MathMin(position.x, viewRect.right - wrapperRect.width);
        position.y = $MathMin(position.y, viewRect.bottom - wrapperRect.height);
        this.#setPosition(position.x, position.y);
    };
    #postDelay(ev, element) {
        this.#DelayHandle = void 0;
        this.#SlottedClassList()?.add(this.#Indicator);
        this.#WrapperElement.style.zIndex = element.style.zIndex ?? 0;
        this.#setContent($AttrAncestor(element, this.#Source));
        this.#onMouseMove(ev);
        $ListenerAdd($ElemDocument(element), EV_MouseMove, this);
    }
    #onTippsUp(ev) {
        const element = ev.target;
        if ($IOfHTMLElement(element)) {
            this.#CurrentElement = element;
            if (this.#LoiterHandle) {
                this.#LoiterHandle = $TimeoutClear(this.#LoiterHandle);
                this.#postDelay(ev, element);
            }
            else
                this.#DelayHandle = $TimeoutSet(() => this.#postDelay(ev, element), this.#Delay);
        }
    }
    #postLoiter() {
        this.#LoiterHandle = void 0;
        this.#setContent();
        this.#WrapperElement.style.zIndex = "-1";
        this.#SlottedClassList()?.remove(this.#Indicator);
    }
    onTippsDown(ev) {
        this.#DelayHandle = $TimeoutClear(this.#DelayHandle);
        this.#LoiterHandle = $TimeoutClear(this.#LoiterHandle);
        $ListenerRemove($ElemDocument(this.#CurrentElement), EV_MouseMove, this);
        if (!ev || $ArrayHas([EV_Click, EV_MouseDown], ev.type))
            this.#postLoiter();
        else
            this.#LoiterHandle = $TimeoutSet(() => this.#postLoiter(), this.#Loiter);
        this.#CurrentElement = null;
    }
}

const VisorAttributes = TippsVisor.observedAttributes;
class Tipps extends HTMLElement {
    static QN = 'tipps';
    static QR = $Frozen([...TippsVisor.QR, Tipps]);
    #State = new WeakSet();
    #Visor = new TippsVisor();
    #DocumentObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            let attr = mutation.attributeName;
            let target = mutation.target;
            if (target === this && attr) {
                if (attr === AN_target)
                    this.connectedCallback();
                else if ($ArrayHas(VisorAttributes, attr))
                    $AttrUpdate(this.#Visor, attr, $Attr(this, attr));
            }
            else if (mutation.type === "childList") {
                mutation.removedNodes.forEach(rn => this.#excise(rn));
                mutation.addedNodes.forEach(an => this.#affix(an));
            }
            else if (mutation.type === "attributes") {
                this.#excise(target);
                this.#affix(target);
            }
        }
    });
    #excise(elem) {
        if ($IOfHTMLElement(elem)) {
            for (const node of $ElemSelfAndAll(elem)) {
                if ($IOfHTMLElement(node) && this.#State.delete(node)) {
                    $ListenerRemoveMany(node, EV_TippsVisor, this.#Visor);
                }
            }
        }
    }
    #affix(elem) {
        const selector = $Attr(this, AN_target);
        if (selector && $IOfHTMLElement(elem)) {
            for (const node of $ElemQuerySelfAndAll(elem, selector)) {
                if ($IOfHTMLElement(node) && !this.#State.has(node)) {
                    this.#State.add(node);
                    $ListenerAddMany(node, EV_TippsVisor, this.#Visor);
                }
            }
        }
    }
    connectedCallback() {
        const baseNode = this.parentNode;
        if (baseNode) {
            VisorAttributes.forEach(attr => $AttrUpdate(this.#Visor, attr, $Attr(this, attr)));
            this.#Visor.onTippsDown(null);
            this.#excise(baseNode);
            this.#affix(baseNode);
            this.#DocumentObserver.disconnect();
            this.#DocumentObserver.observe(baseNode, {
                childList: true, subtree: true,
                attributeFilter: VisorAttributes
            });
            $ElemDocument(this).body.appendChild(this.#Visor).append(...this.children);
        }
    }
}

const EV_TumblrAudioEvents = $Frozen([EV_MediaPlay, EV_MediaPause, EV_MediaEnded]);
const EV_TumblrAudioAttributes = $Frozen([AN_target, AN_indicator, AN_simultaneous]);
class TumblrAudio extends HTMLElement {
    static QN = 'tmblr-audio';
    static QR = $Frozen([TumblrAudio]);
    #State = new WeakSet();
    get #Indicator() { return $Attr(this, AN_indicator) ?? 'playing'; }
    get #Simultaneous() { return !!($Attr(this, AN_simultaneous)); }
    #DocumentObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            let attr = mutation.attributeName;
            let target = mutation.target;
            if (target === this && attr) {
                if ($ArrayHas(EV_TumblrAudioAttributes, attr))
                    this.connectedCallback();
            }
            else if (mutation.type === "childList") {
                mutation.removedNodes.forEach(rn => this.#excise(rn));
                mutation.addedNodes.forEach(an => this.#affix(an));
            }
            else if (mutation.type === "attributes") {
                this.#excise(target);
                this.#affix(target);
            }
        }
    });
    #excise(elem) {
        if ($IOfHTMLElement(elem)) {
            for (const node of $ElemSelfAndAll(elem)) {
                if ($IOfHTMLElement(node) && this.#State.delete(node)) {
                    $ListenerRemove(node, EV_MouseDown, this);
                    $ListenerRemoveMany(node, EV_TumblrAudioEvents, this);
                    $ClassRemove(node, this.#Indicator);
                }
            }
        }
    }
    #affix(elem) {
        const selector = $Attr(this, AN_target);
        if (selector && $IOfHTMLElement(elem)) {
            for (const node of $ElemQuerySelfAndAll(elem, selector)) {
                if ($IOfHTMLElement(node) && !this.#State.has(node)) {
                    const sibling = node.nextElementSibling;
                    if ($IOfHTMLAudioElement(sibling)) {
                        $ClassToggle(node, this.#Indicator, !sibling.paused);
                    }
                    $ListenerAdd(node, EV_MouseDown, this);
                    this.#State.add(node);
                }
            }
        }
    }
    handleEvent(ev) {
        const element = ev.target;
        if ($IOfMouseEvent(ev)) {
            if ($IOfHTMLElement(element)) {
                const sibling = element.nextElementSibling;
                if ($IOfHTMLAudioElement(sibling)) {
                    if (!this.#State.has(sibling)) {
                        $ListenerAddMany(sibling, EV_TumblrAudioEvents, this);
                        this.#State.add(sibling);
                    }
                    if (sibling.paused) {
                        if (!this.#Simultaneous) {
                            const baseNode = this.parentElement;
                            if (baseNode) {
                                $ElemQuerySelfAndAll(baseNode, "audio").forEach(el => el.pause());
                            }
                        }
                        sibling.play();
                    }
                    else
                        sibling.pause();
                }
            }
        }
        else if ($ArrayHas(EV_TumblrAudioEvents, ev.type)) {
            if ($IOfHTMLAudioElement(element)) {
                $ClassToggle(element.previousElementSibling, this.#Indicator, !element.paused);
            }
        }
    }
    connectedCallback() {
        const baseNode = this.parentNode;
        if (baseNode) {
            this.#excise(baseNode);
            this.#affix(baseNode);
            this.#DocumentObserver.disconnect();
            this.#DocumentObserver.observe(baseNode, {
                childList: true, subtree: true,
                attributeFilter: EV_TumblrAudioAttributes
            });
        }
    }
}

const Registrations = [
    ...Tipps.QR,
    ...TumblrAudio.QR
];
Registrations.forEach(x => customElements.define(`wb-${x.QN}`, x));
