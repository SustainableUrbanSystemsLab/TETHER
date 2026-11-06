import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

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
 * `children` supplies its own trigger element (button, link, or a plain
 * span with `tabIndex={0}` for keyboard access) — React's focus/blur
 * events bubble, so no extra focusable wrapper is needed here.
 */
export function Tooltip({
  text,
  children,
  className = "",
}: {
  text: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  function openAt() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
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
        pos &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            className="pointer-events-none fixed z-50 w-max max-w-xs -translate-x-1/2 -translate-y-full rounded-lg border border-gray-200 bg-surface p-2.5 text-left text-xs font-normal leading-relaxed text-gray-700 shadow-lg"
            style={{ top: pos.top, left: pos.left }}
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}
