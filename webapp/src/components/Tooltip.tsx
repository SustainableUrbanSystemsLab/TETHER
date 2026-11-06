import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Rough popup footprint for the flip check below — the real size depends on
// the text, but these only need to be in the right ballpark: better to flip
// a little early than to render clipped.
const EST_HEIGHT = 70;
const EST_WIDTH = 240;

type Placement = "top" | "right";
type Resolved = Placement | "bottom" | "left";

function resolvePlacement(rect: DOMRect, placement: Placement): Resolved {
  if (placement === "top") {
    return rect.top < EST_HEIGHT ? "bottom" : "top";
  }
  return window.innerWidth - rect.right < EST_WIDTH ? "left" : "right";
}

function popupPosition(rect: DOMRect, resolved: Resolved): { top: number; left: number } {
  switch (resolved) {
    case "top":
      return { top: rect.top - 8, left: rect.left + rect.width / 2 };
    case "bottom":
      return { top: rect.bottom + 8, left: rect.left + rect.width / 2 };
    case "right":
      return { top: rect.top + rect.height / 2, left: rect.right + 8 };
    case "left":
      return { top: rect.top + rect.height / 2, left: rect.left - 8 };
  }
}

const POPUP_TRANSFORM: Record<Resolved, string> = {
  top: "-translate-x-1/2 -translate-y-full",
  bottom: "-translate-x-1/2",
  right: "-translate-y-1/2",
  left: "-translate-x-full -translate-y-1/2",
};

/**
 * Hover/focus popup that opens immediately — unlike a native `title`
 * attribute, which waits out the browser's own hover delay. Use this in
 * place of `title="..."` wherever the hint is worth reading right away.
 *
 * Rendered through a portal to `document.body` and positioned from the
 * trigger's own bounding box: several uses sit inside a horizontally
 * scrolling table (`overflow-x-auto`), and a plain absolutely-positioned
 * child would be clipped by that ancestor's (also-clipped) cross axis.
 *
 * `placement` picks a preferred SIDE ("top", the default, or "right"); if
 * the trigger sits too close to that edge of the viewport the popup flips
 * to the opposite side (top -> bottom, right -> left) instead of rendering
 * off-screen — a fixed header logo or an icon in a page's top corner both
 * just work without per-caller tuning.
 *
 * `children` supplies its own trigger element (button, link, or a plain
 * span with `tabIndex={0}` for keyboard access) — React's focus/blur
 * events bubble, so no extra focusable wrapper is needed here.
 */
export function Tooltip({
  text,
  children,
  className = "",
  placement = "top",
}: {
  text: string;
  children: ReactNode;
  className?: string;
  placement?: Placement;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ pos: { top: number; left: number }; resolved: Resolved } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  function openAt() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const resolved = resolvePlacement(rect, placement);
    setState({ pos: popupPosition(rect, resolved), resolved });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { capture: true, passive: true });
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, { capture: true });
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <span
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      aria-describedby={open ? id : undefined}
      onMouseEnter={openAt}
      onMouseLeave={() => setOpen(false)}
      onFocus={openAt}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      {children}
      {open &&
        state &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            className={`pointer-events-none fixed z-50 w-max max-w-xs rounded-lg border border-gray-200 bg-surface p-2.5 text-left text-xs font-normal leading-relaxed text-gray-700 shadow-lg ${POPUP_TRANSFORM[state.resolved]}`}
            style={{ top: state.pos.top, left: state.pos.left }}
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}
