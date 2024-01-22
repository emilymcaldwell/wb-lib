/*! wb-lib | https://github.com/emilymcaldwell/wb-lib/blob/main/LICENSE */
function DOMRect_FromView(view, margin) {
    const margin2 = margin * 2;
    return new DOMRect(view.scrollX + margin, view.scrollY + margin, view.innerWidth - margin2, view.innerHeight - margin2);
}

class TippsVisor extends HTMLElement {
    static QN = 'tipps-visor';
    static QR = Object.freeze([TippsVisor]);
    Pursue = true;
    Margin = 4;
    #WrapperElement;
    #SlotElement;
    #Indicator = '';
    #CurrentElement = null;
    #DelayHandle;
    #LoiterHandle;
    get #SlottedCL() {
        return this.firstElementChild?.classList ?? null;
    }
    constructor() {
        super();
        let ShadowRoot = this.attachShadow({ mode: 'closed' });
        let ShadowDoc = ShadowRoot.ownerDocument;
        let we = this.#WrapperElement = ShadowRoot.appendChild(ShadowDoc.createElement("div"));
        we.style.position = "absolute";
        we.style.pointerEvents = "none";
        this.#SlotElement = we.appendChild(ShadowDoc.createElement("slot"));
    }
    updateIndicator(newIndicator) {
        const elemCL = this.#SlottedCL;
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
        const WrapperStyle = this.#WrapperElement.style;
        WrapperStyle.left = pixelsX + 'px';
        WrapperStyle.top = pixelsY + 'px';
    }
    #onMouseMove = (ev) => {
        const targetView = this.#CurrentElement?.ownerDocument?.defaultView;
        if (!targetView)
            return;
        const wrapperRect = this.#WrapperElement.getBoundingClientRect();
        const mouseRect = new DOMRect(ev.pageX, ev.pageY, 18, 18);
        const viewRect = DOMRect_FromView(targetView, this.Margin);
        let position = new DOMPoint(mouseRect.x, (mouseRect.y - wrapperRect.height));
        let overrun = new DOMPoint(Math.max(0, (viewRect.left - position.x)) + Math.min(0, (viewRect.right - (position.x + wrapperRect.width))), Math.max(0, (viewRect.top - position.y)) + Math.min(0, (viewRect.bottom - position.y)));
        position.x += (overrun.x ? overrun.x : (mouseRect.width * (overrun.y / wrapperRect.height)));
        position.y += overrun.y;
        position.x = Math.min(position.x, viewRect.right - wrapperRect.width);
        position.y = Math.min(position.y, viewRect.bottom - wrapperRect.height);
        this.#setPosition(position.x, position.y);
    };
    #postDelay(tipps, ev, element) {
        this.#DelayHandle = void 0;
        this.#SlottedCL?.add(this.#Indicator);
        this.#WrapperElement.style.zIndex = element.style.zIndex ?? "0";
        this.#setContent(element.getAttribute(tipps.Source));
        if (this.Pursue) {
            this.#onMouseMove(ev);
            element.ownerDocument.addEventListener("mousemove", this.#onMouseMove);
        }
        else {
            const elemRect = element.getBoundingClientRect();
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
        this.#SlottedCL?.remove(this.#Indicator);
    }
    onTippsDown(tipps, ev) {
        this.#DelayHandle = clearTimeout(this.#DelayHandle);
        this.#LoiterHandle = clearTimeout(this.#LoiterHandle);
        this.#CurrentElement?.ownerDocument.removeEventListener("mousemove", this.#onMouseMove);
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
    static QR = Object.freeze([...TippsVisor.QR, Tipps]);
    static observedAttributes = Object.freeze([AN_target, AN_indicator, AN_source, AN_pursue, AN_margin, AN_delay, AN_loiter]);
    #Visor = new TippsVisor();
    #DocumentObserver = new MutationObserver((mutations, observer) => {
        let targetSelector = this.#Target;
        for (const mutation of mutations) {
            if (mutation.type === "childList") {
                mutation.removedNodes.forEach(rn => this.#updateEvents(rn, targetSelector, true));
                mutation.addedNodes.forEach(an => this.#updateEvents(an, targetSelector));
            }
            else if (mutation.type === "attributes") {
                this.#updateEvents(mutation.target, targetSelector, true);
                this.#updateEvents(mutation.target, targetSelector);
            }
        }
    });
    #onTippsUp = (ev) => this.#Visor.onTippsUp(this, ev);
    #onTippsDown = (ev) => this.#Visor.onTippsDown(this, ev);
    #updateEvents(node, selector, remove = false) {
        const ShouldUpdate = node instanceof HTMLElement && node.matches(selector);
        if (ShouldUpdate) {
            const targetFn = remove ? node.removeEventListener : node.addEventListener;
            targetFn.bind(node)("mouseover", this.#onTippsUp);
            targetFn.bind(node)("mouseout", this.#onTippsDown);
            targetFn.bind(node)("mousedown", this.#onTippsDown);
            targetFn.bind(node)("click", this.#onTippsDown);
        }
    }
    get #Target() { return this.getAttribute(AN_target) ?? '[title]'; }
    get #Indicator() { return this.getAttribute(AN_indicator) ?? 'active'; }
    get Source() { return this.getAttribute(AN_source) ?? 'title'; }
    get #Pursue() {
        if (!this.hasAttribute(AN_pursue))
            return false;
        const value = this.getAttribute(AN_pursue);
        if (!value)
            return true;
        return !(/^\s*(false|0|off)\s*$/i.test(value));
    }
    get #Margin() { return Number(this.getAttribute(AN_margin) ?? 4); }
    get Delay() { return Number(this.getAttribute(AN_delay) ?? 700); }
    get Loiter() { return Number(this.getAttribute(AN_loiter) ?? 300); }
    connectedCallback() {
        const baseNode = this.parentNode;
        if (baseNode) {
            const targetSelector = this.#Target;
            const targetQuery = baseNode.querySelectorAll(targetSelector);
            for (const existingNode of targetQuery) {
                this.#updateEvents(existingNode, targetSelector, true);
                this.#updateEvents(existingNode, targetSelector);
            }
            this.#DocumentObserver.disconnect();
            this.#DocumentObserver.observe(baseNode, { childList: true, subtree: true, characterData: false });
            this.#Visor.append(...this.children);
            baseNode.appendChild(this.#Visor);
            this.#Visor.Pursue = this.#Pursue;
            this.#Visor.updateIndicator(this.#Indicator);
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case AN_target: return this.connectedCallback();
            case AN_pursue: return void (this.#Visor.Pursue = this.#Pursue);
            case AN_indicator: return void (this.#Visor.updateIndicator(this.#Indicator));
            case AN_margin: return void (this.#Visor.Margin = this.#Margin);
        }
    }
}

const Registrations = [
    ...Tipps.QR
];
Registrations.forEach(x => customElements.define(`wb-${x.QN}`, x));
