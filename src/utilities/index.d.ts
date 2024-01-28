type $AttrTy = {
  (elem: Element, attr: string) : string | null;
  (elem: Element | null | undefined, attr: string) : string | null;
};

type $AttrUpdateTy = {
  (elem: Element | null | undefined, attr: string | null | undefined, value: string | null | undefined) : void;
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