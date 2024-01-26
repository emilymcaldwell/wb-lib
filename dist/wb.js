/*! wb-lib | https://github.com/emilymcaldwell/wb-lib/blob/main/LICENSE */
function DOMRect_FromView(view, margin) {
    const margin2 = margin * 2;
    return new DOMRect(view.scrollX + margin, view.scrollY + margin, view.innerWidth - margin2, view.innerHeight - margin2);
}

const $Assign = Object.assign;
const $Frozen = Object.freeze;
const $Style = (elem, obj) => $Assign(elem.style, obj);
const $Attr = (elem, attr) => elem.getAttribute(attr);
const $ElemEmplace = (document, parent, tagName, options) => parent.appendChild(document.createElement(tagName, options));
const $ElemQueryAll = ((elem, query) => elem.querySelectorAll(query));
const $ElemBounds = ((elem) => elem?.getBoundingClientRect());
const $ElemDocument = ((elem) => elem?.ownerDocument);

class TippsVisor extends HTMLElement {
    static QN = 'tipps-visor';
    static QR = $Frozen([TippsVisor]);
    Pursue = true;
    Margin = 4;
    #WrapperElement;
    #SlotElement;
    #Indicator = '';
    #CurrentElement = null;
    #DelayHandle;
    #LoiterHandle;
    #SlottedClassList = () => this.firstElementChild?.classList ?? null;
    constructor() {
        super();
        const ShadowRoot = this.attachShadow({ mode: 'closed' });
        const ShadowDoc = $ElemDocument(ShadowRoot);
        const we = this.#WrapperElement = $ElemEmplace(ShadowDoc, ShadowRoot, "div");
        $Style(we, { position: "absolute", pointerEvents: "none" });
        this.#setPosition(0, 0);
        this.#SlotElement = $ElemEmplace(ShadowDoc, we, "slot");
    }
    setIdr(newIndicator) {
        const elemCL = this.#SlottedClassList();
        if (elemCL?.contains(this.#Indicator)) {
            elemCL.remove(this.#Indicator);
            elemCL.add(newIndicator);
        }
        this.#Indicator = newIndicator;
    }
    #setContent(content = null) {
        (this.querySelector('slot[name=prompt]') ?? this.#SlotElement).innerText = content ?? '';
    }
    #setPosition(pixelsX, pixelsY) {
        $Style(this.#WrapperElement, { left: pixelsX + 'px', top: pixelsY + 'px' });
    }
    #onMouseMove = (ev) => {
        const targetView = $ElemDocument(this.#CurrentElement)?.defaultView;
        if (!targetView)
            return;
        const wrapperRect = $ElemBounds(this.#WrapperElement);
        const mouseRect = new DOMRect(ev.pageX, ev.pageY, 18, 18);
        const viewRect = DOMRect_FromView(targetView, this.Margin);
        const position = new DOMPoint(mouseRect.x, (mouseRect.y - wrapperRect.height));
        const overrun = new DOMPoint(Math.max(0, (viewRect.left - position.x)) + Math.min(0, (viewRect.right - (position.x + wrapperRect.width))), Math.max(0, (viewRect.top - position.y)) + Math.min(0, (viewRect.bottom - position.y)));
        position.x += (overrun.x ? overrun.x : (mouseRect.width * (overrun.y / wrapperRect.height)));
        position.y += overrun.y;
        position.x = Math.min(position.x, viewRect.right - wrapperRect.width);
        position.y = Math.min(position.y, viewRect.bottom - wrapperRect.height);
        this.#setPosition(position.x, position.y);
    };
    #postDelay(tipps, ev, element) {
        this.#DelayHandle = void 0;
        this.#SlottedClassList()?.add(this.#Indicator);
        this.#WrapperElement.style.zIndex = element.style.zIndex ?? 0;
        this.#setContent($Attr(element, tipps.Source));
        if (this.Pursue) {
            this.#onMouseMove(ev);
            $ElemDocument(element).addEventListener("mousemove", this.#onMouseMove);
        }
        else {
            const elemRect = $ElemBounds(element);
            this.#setPosition(elemRect.right - this.Margin, elemRect.bottom - this.Margin);
        }
    }
    onTippsUp(tipps, ev) {
        const element = ev.target;
        if (!(element instanceof HTMLElement))
            return;
        if (this.#LoiterHandle) {
            this.#LoiterHandle = clearTimeout(this.#LoiterHandle);
            this.#postDelay(tipps, ev, (this.#CurrentElement = element));
        }
        else {
            this.#CurrentElement = element;
            this.#DelayHandle = setTimeout(() => this.#postDelay(tipps, ev, element), tipps.Delay);
        }
    }
    #postLoiter() {
        this.#LoiterHandle = void 0;
        this.#setContent();
        this.#WrapperElement.style.zIndex = "-1";
        this.#SlottedClassList()?.remove(this.#Indicator);
    }
    onTippsDown(tipps, ev) {
        this.#DelayHandle = clearTimeout(this.#DelayHandle);
        this.#LoiterHandle = clearTimeout(this.#LoiterHandle);
        $ElemDocument(this.#CurrentElement)?.removeEventListener("mousemove", this.#onMouseMove);
        if (ev.type === "click" || ev.type === "mousedown")
            this.#postLoiter();
        else
            this.#LoiterHandle = setTimeout(() => this.#postLoiter(), tipps.Loiter);
        this.#CurrentElement = null;
    }
}

const AN_target = "target";
const AN_indicator = "indicator";
const AN_source = "source";
const AN_pursue = "pursue";
const AN_margin = "margin";
const AN_delay = "delay";
const AN_loiter = "loiter";
class Tipps extends HTMLElement {
    static QN = 'tipps';
    static QR = $Frozen([...TippsVisor.QR, Tipps]);
    static observedAttributes = $Frozen([AN_target, AN_indicator, AN_source, AN_pursue, AN_margin, AN_delay, AN_loiter]);
    #Visor = new TippsVisor();
    #DocumentObserver = new MutationObserver((mutations) => {
        const targetSelector = this.#Target;
        for (const mutation of mutations) {
            if (mutation.target === this)
                return;
            else if (mutation.type === "childList") {
                mutation.removedNodes.forEach(rn => this.#updateEvents(rn, targetSelector, 1));
                mutation.addedNodes.forEach(an => this.#updateEvents(an, targetSelector));
            }
            else if (mutation.type === "attributes") {
                this.#updateEvents(mutation.target, targetSelector, 1);
                this.#updateEvents(mutation.target, targetSelector);
            }
        }
    });
    #onTippsUp = (ev) => this.#Visor.onTippsUp(this, ev);
    #onTippsDown = (ev) => this.#Visor.onTippsDown(this, ev);
    #updateEvents(node, selector, remove = 0) {
        if (node instanceof HTMLElement && node.matches(selector)) {
            const targetFn = (remove ? node.removeEventListener : node.addEventListener).bind(node);
            targetFn("mouseover", this.#onTippsUp);
            ["mouseout", "mousedown", "click"].forEach(e => targetFn(e, this.#onTippsDown));
        }
    }
    get #Target() { return $Attr(this, AN_target) ?? '[title]'; }
    get #Indicator() { return $Attr(this, AN_indicator) ?? 'active'; }
    get Source() { return $Attr(this, AN_source) ?? 'title'; }
    get #Pursue() {
        if (!this.hasAttribute(AN_pursue))
            return false;
        const value = $Attr(this, AN_pursue);
        if (!value)
            return true;
        return !(/^\s*(false|0|off)\s*$/i.test(value));
    }
    get #Margin() { return Number($Attr(this, AN_margin) ?? 4); }
    get Delay() { return Number($Attr(this, AN_delay) ?? 700); }
    get Loiter() { return Number($Attr(this, AN_loiter) ?? 300); }
    connectedCallback() {
        const baseNode = this.parentNode;
        if (baseNode) {
            const targetSelector = this.#Target;
            for (const existingNode of $ElemQueryAll(baseNode, targetSelector)) {
                this.#updateEvents(existingNode, targetSelector, 1);
                this.#updateEvents(existingNode, targetSelector);
            }
            this.#DocumentObserver.disconnect();
            this.#DocumentObserver.observe(baseNode, {
                childList: true, subtree: true,
                attributeFilter: Tipps.observedAttributes
            });
            $ElemDocument(this).body.appendChild(this.#Visor).append(...this.children);
            this.#Visor.Pursue = this.#Pursue;
            this.#Visor.setIdr(this.#Indicator);
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case AN_target:
                this.connectedCallback();
                break;
            case AN_pursue:
                this.#Visor.Pursue = this.#Pursue;
                break;
            case AN_indicator:
                this.#Visor.setIdr(this.#Indicator);
                break;
            case AN_margin:
                this.#Visor.Margin = this.#Margin;
                break;
        }
    }
}

const Registrations = [
    ...Tipps.QR
];
Registrations.forEach(x => customElements.define(`wb-${x.QN}`, x));
