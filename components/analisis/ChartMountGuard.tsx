"use client";

import { useSyncExternalStore } from "react";

export default function ChartMountGuard({
  height,
  children,
}: {
  height: number;
  children: React.ReactNode;
}) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) {
    return (
      <div
        style={{ height }}
        className="w-full min-w-0 animate-pulse rounded-2xl bg-slate-100"
        aria-hidden="true"
      />
    );
  }

  return (
    <div style={{ height }} className="w-full min-w-0">
      {children}
    </div>
  );
}
