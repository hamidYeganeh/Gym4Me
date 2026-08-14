import { Spinner } from "@heroui/react";

export function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
