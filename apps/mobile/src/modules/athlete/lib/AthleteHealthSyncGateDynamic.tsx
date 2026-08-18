"use client";

import { Spinner } from "@heroui/react/spinner";
import dynamic from "next/dynamic";

const chunkFallback = (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Spinner size="lg" />
  </div>
);

export const AthleteHealthSyncGateDynamic = dynamic(
  () =>
    import("./AthleteHealthSyncGate").then((mod) => ({
      default: mod.AthleteHealthSyncGate,
    })),
  { ssr: false, loading: () => chunkFallback },
);
