type $ClassTy = {
  (elem: null) : null;
  (elem: undefined) : null;
  (elem: Element) : DOMTokenList;
  (elem: Element | null | undefined) : DOMTokenList | null;
};

type $ClassToggleTy = {
  (elem: null, className: string, force: boolean | undefined) : null;
  (elem: undefined, className: string, force: boolean | undefined) : null;
  (elem: Element, className: string, force: boolean | undefined) : boolean;
  (elem: Element | null | undefined, className: string, force: boolean | undefined) : boolean | null;
};

type $ClassAddRemoveTy = {
  (elem: null, className: string) : void;
  (elem: undefined, className: string) : void;
  (elem: Element, className: string) : void;
  (elem: Element | null | undefined, className: string) : void;
};

type $AttrTy = {
  (elem: Element, attr: string) : string | null;
  (elem: Element | null | undefined, attr: string) : string | null;
};

type $AttrUpdateTy = {
  (elem: Element | null | undefined, attr: string | null | undefined, value: string | null | undefined) : void;
};

type $ElemQueryTy = {
  <K extends keyof HTMLElementTagNameMap>(elem: { querySelector: ((selectors: K) => HTMLElementTagNameMap[K] | null) }, query: K): HTMLElementTagNameMap[K] | null;
  <K extends keyof SVGElementTagNameMap>(elem: { querySelector: ((selectors: K) => SVGElementTagNameMap[K] | null) }, query: K): SVGElementTagNameMap[K] | null;
  <K extends keyof MathMLElementTagNameMap>(elem: { querySelector: ((selectors: K) => MathMLElementTagNameMap[K] | null) }, query: K): MathMLElementTagNameMap[K] | null;
  <E extends Element = Element>(elem: { querySelector: ((selectors: K) => E | null) }, query: string): E | null;
};

type $ElemBoundsTy = {
  (elem: null) : null;
  (elem: undefined) : undefined;
  (elem: Element) : DOMRect;
  (elem: Element | null) : DOMRect | null;
  (elem: Element | undefined) : DOMRect | undefined;
};

type $ElemDocumentTy = {
  (elem: null) : null;
  (elem: undefined) : undefined;
  (elem: { ownerDocument: Document }) : Document;
  (elem: { ownerDocument: Document } | null) : Document | null;
  (elem: { ownerDocument: Document } | undefined) : Document | undefined;
};

type $ArrayHas = {
  <T>(arr: null, searchElement: T) : null;
  <T>(arr: undefined, searchElement: T) : null;
  <T>(arr: Array<T> | ReadonlyArray<T>, searchElement: T) : boolean;
}

type $ListenerAddRemoveTy = {
  <T extends EventSource, K extends keyof EventSourceEventMap>(elem: T | null | undefined, type: K, listener: (this: EventSource, ev: EventSourceEventMap[K]) => any) : void;
  <T extends EventTarget>(elem: T | null | undefined, type: string, listener: EventListenerOrEventListenerObject | null) : void;
}

type $ListenerAddRemoveManyTy = {
  <T extends EventSource, K extends keyof EventSourceEventMap>(elem: T | null | undefined, types: ArrayLike<K>, listener: (this: EventSource, ev: EventSourceEventMap[K]) => any) : void;
  <T extends EventTarget>(elem: T | null | undefined, types: ArrayLike<string>, listener: EventListenerOrEventListenerObject | null) : void;
}
