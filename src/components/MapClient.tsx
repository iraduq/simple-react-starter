import { lazy, Suspense } from "react";
import { ClientOnly } from "@/lib/router-compat";

const Map = lazy(() => import("./Map"));

const Fallback = () => <div className="min-h-[420px] w-full bg-[#f4f6f9]" />;

export default function MapClient() {
  return (
    <ClientOnly fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <Map />
      </Suspense>
    </ClientOnly>
  );
}
