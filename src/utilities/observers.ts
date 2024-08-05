
export const $MutationObserver_Tri = (
      onAttr: (target: Node, attrName: string) => void
    , onChildAdded: (an: Node) => void
    , onChildRemoved: (rn: Node) => void
  ) => new MutationObserver(
    (mutations: MutationRecord[]) =>
    {
      for (const mutation of mutations)
      {
        const attr = mutation.attributeName;
        if (mutation.type === "childList")
        {
          mutation.removedNodes.forEach(onChildAdded)
          mutation.addedNodes.forEach(onChildRemoved);
        }
        else if (attr)
        {
          onAttr(mutation.target, attr);
        }
      }
    }
  );
