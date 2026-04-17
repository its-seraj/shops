"use client";

import Script from "next/script";
import { useEffect } from "react";
import { isMetaPixelConfigured, trackMetaEvent } from "@/lib/shop";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function MetaPixel({ pixelId }: { pixelId?: string }) {
  useEffect(() => {
    trackMetaEvent({
      pixelId,
      eventName: "PageView",
      fbq: window.fbq
    });
  }, [pixelId]);

  if (!isMetaPixelConfigured(pixelId)) {
    return null;
  }

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
      `}
    </Script>
  );
}
