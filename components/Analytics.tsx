import Script from "next/script";
import { GADS_ID, GA_ID, PIXEL_ID } from "@/lib/tracking";

// Carga las librerías de Meta Pixel y gtag (GA4 / Google Ads) solo si sus IDs
// están definidos, con `lazyOnload` para no afectar Lighthouse. Los stubs y el
// `init` viven en lib/tracking.ts: los eventos quedan en cola hasta que cargan.
export default function Analytics() {
  const gtagId = GA_ID || GADS_ID;
  return (
    <>
      {PIXEL_ID && <Script src="https://connect.facebook.net/en_US/fbevents.js" strategy="lazyOnload" />}
      {gtagId && <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="lazyOnload" />}
    </>
  );
}
