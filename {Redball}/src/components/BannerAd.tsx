import { useEffect, useRef, useState } from "react";
import { useTossBanner } from "../hooks/useTossBanner";

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AIT === "true";

export function BannerAd({ adGroupId }: { adGroupId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isInitialized, isSupported, attachBanner } = useTossBanner();
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    if (DEV_BYPASS || !isInitialized || !containerRef.current) return;
    const attached = attachBanner(adGroupId, containerRef.current, {
      theme: "dark",
      tone: "red",
      variant: "expanded",
      callbacks: {
        onAdRendered: () => setAdFailed(false),
        onAdViewable: () => {},
        onNoFill: () => setAdFailed(true),
        onAdFailedToRender: () => setAdFailed(true),
      },
    });
    return () => { attached?.destroy(); };
  }, [isInitialized, attachBanner, adGroupId]);

  if (DEV_BYPASS) {
    return (
      <div style={{
        margin: "0 16px", padding: 14, background: "#1A1A2E", borderRadius: 12,
        textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.4)",
        border: "1px dashed rgba(255,255,255,.15)",
      }}>광고 배너 (DEV)</div>
    );
  }

  if (!isSupported || adFailed) return null;

  return <div ref={containerRef} style={{ width: "100%", height: 96, margin: "0 16px" }} />;
}
