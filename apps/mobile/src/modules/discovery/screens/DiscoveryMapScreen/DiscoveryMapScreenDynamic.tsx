"use client";

import { Spinner } from "@heroui/react/spinner";
import dynamic from "next/dynamic";

const chunkFallback = (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Spinner size="lg" />
  </div>
);

export const DiscoveryMapScreenDynamic = dynamic(
  () =>
    import("./DiscoveryMapScreenLoader").then((mod) => ({
      default: mod.DiscoveryMapScreenLoader,
    })),
  { ssr: false, loading: () => chunkFallback },
);
