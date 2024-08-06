/// <reference path="./index.d.ts" />

export * from "./rects";
export * from "./observers";

export const $Assign = Object.assign;
export const $Frozen = Object.freeze;
export const $MathMax = Math.max;
export const $MathMin = Math.min;
export const $TimeoutClear = clearTimeout;
export const $TimeoutSet = setTimeout;

export const $Style = (elem: HTMLElement | null, obj?: Partial<CSSStyleDeclaration>) => elem && obj ? $Assign(elem.style, obj) : elem?.style ?? null;

export const $StrPixels = (px: number) => px + 'px';

export const $Class = ((elem: Element | null | undefined) => elem?.classList ?? null) as $ClassTy;
export const $ClassToggle = ((elem: Element | null | undefined, className: string, force: boolean | undefined) => $Class(elem)?.toggle(className, force) ?? null) as $ClassToggleTy;
export const $ClassAdd = ((elem: Element | null | undefined, className: string) => $ClassToggle(elem, className, true) ?? null) as $ClassAddRemoveTy;
export const $ClassRemove = ((elem: Element | null | undefined, className: string) => $ClassToggle(elem, className, false) ?? null) as $ClassAddRemoveTy;

export const $Attr: $AttrTy = (elem, attr) => elem?.getAttribute(attr) ?? null;
export const $AttrHierarchy: $AttrTy = (elem, attr) => $Attr(((attrQuery) => elem?.matches(attrQuery) ? elem : elem?.closest(attrQuery))(`[${attr}]`), attr);
export const $AttrUpdate: $AttrUpdateTy = (elem, attr, value) => attr && (value ? elem?.setAttribute(attr, value) : elem?.removeAttribute(attr));

export const $ElemEmplace = <K extends keyof HTMLElementTagNameMap>(document: Document, parent: Node, tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K] =>
  parent.appendChild(document.createElement(tagName, options));

export const $ElemParent = (elem: { parentElement: HTMLElement | null }) => elem.parentElement ?? null;
export const $ElemNextSibling = (elem: { nextElementSibling: Element | null }) => elem.nextElementSibling ?? null;
export const $ElemPrevSibling = (elem: { previousElementSibling: Element | null }) => elem.previousElementSibling ?? null;
export const $ElemQuery: $ElemQueryTy = (<T>(elem: { querySelector: ((selectors: T) => any) }, query: any) => elem.querySelector(query));
export const $ElemQueryAll = ((elem: HTMLElement | ParentNode, query: any) => elem.querySelectorAll(query));

export const $ElemQueryMatches = ((elem: HTMLElement, query: string) => elem.matches(query));
export const $ElemQuerySelfAndAll = ((elem: HTMLElement, query: string) => [...($ElemQueryMatches(elem, query) ? [elem] : []) , ...$ElemQueryAll(elem, query)]);
export const $ElemSelfAndAll = ((elem: HTMLElement) => [...[elem] , ...$ElemQueryAll(elem, '*')]);

export const $ElemBounds = ((elem: Element | null | undefined) => elem?.getBoundingClientRect()) as $ElemBoundsTy;
export const $ElemDocument = ((elem: { ownerDocument: Document } | null | undefined) : Document | null | undefined => elem?.ownerDocument) as $ElemDocumentTy;

export const $ArrayHas = (<T>(arr: Array<T> | null | undefined, searchElement: T) => arr?.includes(searchElement) ?? false) as $ArrayHas;

export const $ListenerAdd = (<T extends EventSource, K extends keyof EventSourceEventMap>(elem: T | null | undefined, type: K, listener: (this: EventSource, ev: EventSourceEventMap[K]) => any) => elem?.addEventListener(type, listener)) as $ListenerAddRemoveTy;
export const $ListenerRemove = (<T extends EventSource, K extends keyof EventSourceEventMap>(elem: T | null | undefined, type: K, listener: (this: EventSource, ev: EventSourceEventMap[K]) => any) => elem?.removeEventListener(type, listener)) as $ListenerAddRemoveTy;
export const $ListenerAddMany = (<T extends EventSource, K extends keyof EventSourceEventMap>(elem: T | null | undefined, types: K[], listener: (this: EventSource, ev: EventSourceEventMap[K]) => any) => types.forEach(x => $ListenerAdd(elem, x, listener))) as $ListenerAddRemoveManyTy;
export const $ListenerRemoveMany = (<T extends EventSource, K extends keyof EventSourceEventMap>(elem: T | null | undefined, types: K[], listener: (this: EventSource, ev: EventSourceEventMap[K]) => any) => types.forEach(x => $ListenerRemove(elem, x, listener))) as $ListenerAddRemoveManyTy;


export const $IOfHTMLElement = (elem: unknown): elem is HTMLElement => elem instanceof HTMLElement;
export const $AsHTMLElement = (elem: unknown) => $IOfHTMLElement(elem) ? elem : null;

export const $IOfHTMLAudioElement = (elem: unknown): elem is HTMLAudioElement => elem instanceof HTMLAudioElement;
export const $AsHTMLAudioElement = (elem: unknown) => $IOfHTMLAudioElement(elem) ? elem : null;

export const $IOfMouseEvent = (ev: unknown): ev is MouseEvent => ev instanceof MouseEvent;
export const $AsMouseEvent = (ev: unknown) => $IOfMouseEvent(ev) ? ev : null;