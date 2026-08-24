import { Skeleton } from "@heroui/react";

function Pulse({ className }: { className: string }) {
  return <Skeleton className={className} />;
}

export function DiscoveryComposerSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-5 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Pulse className="h-8 w-64" />
          <Pulse className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Pulse className="h-10 w-28" />
          <Pulse className="h-10 w-32" />
          <Pulse className="h-10 w-20" />
        </div>
      </div>
      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Pulse className="h-16 w-full rounded-xl" key={index} />
            ))}
          </div>
          <div className="space-y-4">
            <div className="space-y-4 rounded-2xl border border-divider bg-surface p-4">
              <div className="flex justify-between">
                <Pulse className="h-6 w-36" />
                <Pulse className="h-8 w-28" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 6 }, (__, field) => (
                  <Pulse className="h-16 w-full" key={field} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <DiscoveryPreviewSkeleton />
      </div>
    </div>
  );
}

export function DiscoveryPreviewSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="space-y-4 rounded-2xl border border-divider bg-surface p-4"
    >
      <Pulse className="h-6 w-44" />
      <Pulse className="h-10 w-full" />
      {Array.from({ length: 3 }, (_, index) => (
        <div className="space-y-3 rounded-xl bg-default-50 p-3" key={index}>
          <Pulse className="h-5 w-32" />
          <div className="flex gap-2">
            <Pulse className="h-14 flex-1" />
            <Pulse className="h-14 flex-1" />
            <Pulse className="h-14 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
