import { useId, useState } from "react";

export function AcronymTooltip({ label, explanation }: { label: string; explanation: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        className="cursor-help underline decoration-dotted underline-offset-2 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-blue-600"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); setOpen(true); }}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
      >
        {label}
      </button>
      {open && (
        <span id={id} role="tooltip" className="absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg border border-gray-200 bg-surface p-3 text-left text-xs font-normal leading-relaxed text-gray-700 shadow-lg">
          {explanation}
        </span>
      )}
    </span>
  );
}

