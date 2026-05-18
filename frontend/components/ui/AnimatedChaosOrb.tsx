import Image from "next/image";

import { cn } from "@/lib/formatters";

type OrbSize = "sm" | "md" | "lg" | "xl";
type OrbIntensity = "subtle" | "normal" | "hero";

const sizeClasses: Record<OrbSize, string> = {
  sm: "h-24 w-24",
  md: "h-36 w-36 md:h-44 md:w-44",
  lg: "h-52 w-52 md:h-72 md:w-72",
  xl: "h-72 w-72 md:h-[28rem] md:w-[28rem]",
};

const intensityClasses: Record<OrbIntensity, string> = {
  subtle: "chaos-orb--subtle",
  normal: "chaos-orb--normal",
  hero: "chaos-orb--hero",
};

export function AnimatedChaosOrb({
  size = "md",
  className,
  intensity = "normal",
}: {
  size?: OrbSize;
  className?: string;
  intensity?: OrbIntensity;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "chaos-orb pointer-events-none relative isolate max-w-full shrink-0 select-none",
        sizeClasses[size],
        intensityClasses[intensity],
        className,
      )}
    >
      <div className="chaos-orb__float absolute inset-0">
        <div className="chaos-orb__blur absolute inset-[7%] rounded-full" />
        <div className="chaos-orb__spin absolute inset-0">
          <Image
            src="/assets/maneuver-chaos-orb.png"
            alt=""
            fill
            sizes="(max-width: 768px) 18rem, 28rem"
            className="chaos-orb__image object-contain"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
