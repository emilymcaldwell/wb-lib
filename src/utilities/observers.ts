
export const $MutationObserver_Tri = (
      onAttr: (target: Node, attrName: string) => void
    , onChildAdded: (target: Node, an: Node) => void
    , onChildRemoved: (target: Node, rn: Node) => void
  ) => new MutationObserver(
    (mutations: MutationRecord[]) =>
    {
      for (const mutation of mutations)
      {
        const attr = mutation.attributeName;
        const target = mutation.target;
        if (mutation.type === "childList")
        {
          mutation.removedNodes.forEach(rn => onChildRemoved(target, rn));
          mutation.addedNodes.forEach(an => onChildAdded(target, an));
        }
        else if (attr)
        {
          onAttr(target, attr);
        }
      }
    }
  );
