"use client";

import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";

const chunkFallback = (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Spinner size="lg" />
  </div>
);

export const AthleteMetricsReorderGateDynamic = dynamic(
  () =>
    import("./AthleteMetricsReorderGate").then((mod) => ({
      default: mod.AthleteMetricsReorderGate,
    })),
  { ssr: false, loading: () => chunkFallback },
);
