"use client";

import dynamic from "next/dynamic";
import { useWasl } from "@/components/providers/WaslProvider";

const DynamicShareCardModal = dynamic(
  () =>
    import("@/components/share/ShareCardModal").then(
      (mod) => mod.ShareCardModal
    ),
  { ssr: false }
);

/**
 * Mounts and lazy-loads the share-card renderer & QR generator bundle ONLY when a user clicks Share.
 */
export function LazyShareCardModal() {
  const { sharePayload } = useWasl();
  if (!sharePayload) return null;
  return <DynamicShareCardModal />;
}
