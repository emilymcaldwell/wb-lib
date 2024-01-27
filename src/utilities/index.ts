
export * from "./rects";

export const $Assign = Object.assign;
export const $Frozen = Object.freeze;
export const $Style = (elem: HTMLElement, obj: Partial<CSSStyleDeclaration>) => $Assign(elem.style, obj);

type $Attr = {
  (elem: null, attr: string) : null;
  (elem: undefined, attr: string) : null;
  (elem: Element, attr: string) : string;
  (elem: Element | null, attr: string) : string | null;
  (elem: Element | undefined, attr: string) : string | null;
};
export const $Attr = ((elem: Element, attr: string) => elem.getAttribute(attr)) as $Attr;

export const $ElemEmplace = <K extends keyof HTMLElementTagNameMap>(document: Document, parent: Node, tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K] =>
  parent.appendChild(document.createElement(tagName, options));

export const $ElemQuery = ((elem: HTMLElement | ParentNode, query: any) => elem.querySelector(query));
export const $ElemQueryAll = ((elem: HTMLElement | ParentNode, query: any) => elem.querySelectorAll(query));

type $ElemBounds = {
  (elem: null) : null;
  (elem: undefined) : undefined;
  (elem: Element) : DOMRect;
  (elem: Element | null) : DOMRect | null;
  (elem: Element | undefined) : DOMRect | undefined;
};
export const $ElemBounds = ((elem: Element | null | undefined) => elem?.getBoundingClientRect()) as $ElemBounds;


type $ElemDocument = {
  (elem: null) : null;
  (elem: undefined) : undefined;
  (elem: { ownerDocument: Document }) : Document;
  (elem: { ownerDocument: Document } | null) : Document | null;
  (elem: { ownerDocument: Document } | undefined) : Document | undefined;
};
export const $ElemDocument = ((elem: { ownerDocument: Document } | null | undefined) : Document | null | undefined => elem?.ownerDocument) as $ElemDocument;