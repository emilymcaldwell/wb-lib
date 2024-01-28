/// <reference path="./index.d.ts" />

export * from "./rects";

export const $Assign = Object.assign;
export const $Frozen = Object.freeze;
export const $MathMax = Math.max;
export const $MathMin = Math.min;
export const $TimeoutClear = clearTimeout;
export const $TimeoutSet = setTimeout;

export const $Style = (elem: HTMLElement, obj: Partial<CSSStyleDeclaration>) => $Assign(elem.style, obj);

export const $Attr: $AttrTy = (elem, attr) => elem?.getAttribute(attr) ?? null;
export const $AttrAncestor: $AttrTy = (elem, attr) => $Attr(((attrQuery) => elem?.matches(attrQuery) ? elem : elem?.closest(attrQuery))(`[${attr}]`), attr);
export const $AttrUpdate: $AttrUpdateTy = (elem, attr, value) => attr && (value ? elem?.setAttribute(attr, value) : elem?.removeAttribute(attr));

export const $ElemEmplace = <K extends keyof HTMLElementTagNameMap>(document: Document, parent: Node, tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K] =>
  parent.appendChild(document.createElement(tagName, options));

export const $ElemQuery = ((elem: HTMLElement | ParentNode, query: any) => elem.querySelector(query));
export const $ElemQueryAll = ((elem: HTMLElement | ParentNode, query: any) => elem.querySelectorAll(query));

export const $ElemQueryMatches = ((elem: HTMLElement, query: string) => elem.matches(query));
export const $ElemQuerySelfAndAll = ((elem: HTMLElement, query: string) => [...($ElemQueryMatches(elem, query) ? [elem] : []) , ...$ElemQueryAll(elem, query)]);
export const $ElemSelfAndAll = ((elem: HTMLElement) => [...[elem] , ...$ElemQueryAll(elem, '*')]);


export const $ElemBounds = ((elem: Element | null | undefined) => elem?.getBoundingClientRect()) as $ElemBoundsTy;

export const $ElemDocument = ((elem: { ownerDocument: Document } | null | undefined) : Document | null | undefined => elem?.ownerDocument) as $ElemDocumentTy;

export const $ArrayHas = (<T>(arr: Array<T> | null | undefined, searchElement: T) => arr?.includes(searchElement) ?? false) as $ArrayHas;
