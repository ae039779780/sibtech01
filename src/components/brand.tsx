import Image from "next/image";
import { cn } from "@/lib/format";

export function Logo({
  compact = false,
  wordmark = true,
}: {
  compact?: boolean;
  wordmark?: boolean;
}) {
  const showWord = !compact && wordmark;
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          "overflow-hidden rounded-xl bg-white ring-1 ring-white/10",
          compact ? "h-9 w-9" : "h-10 w-[3.65rem]",
        )}
      >
        <Image
          src={compact ? "/brand/logo-square.png" : "/brand/logo-mark.png"}
          alt="Sibtech"
          width={compact ? 72 : 180}
          height={compact ? 72 : 123}
          className="h-full w-full object-contain object-center"
          priority
        />
      </span>
      {showWord ? <span className="text-sm font-semibold tracking-wide">Sibtech</span> : null}
    </span>
  );
}

export function LicenseBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[11px] text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-coral" />
      Canadian financial license · operate globally via partners
    </span>
  );
}
