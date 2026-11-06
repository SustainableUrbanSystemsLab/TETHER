import { Tooltip } from "@/components/Tooltip";

export function AcronymTooltip({ label, explanation }: { label: string; explanation: string }) {
  return (
    <Tooltip text={explanation}>
      <span
        tabIndex={0}
        className="cursor-help underline decoration-dotted underline-offset-2 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-blue-600"
      >
        {label}
      </span>
    </Tooltip>
  );
}
