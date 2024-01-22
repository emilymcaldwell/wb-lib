
export function DOMRect_FromView(view: Window, margin: number)
{
  const margin2 = margin * 2;
  return new DOMRect(view.scrollX + margin, view.scrollY + margin, view.innerWidth - margin2, view.innerHeight - margin2);
};
