import Script from "next/script";

interface GTMScriptProps {
  gtmId?: string;
}

export function GTMScript({ gtmId }: GTMScriptProps) {
  if (!gtmId || !gtmId.trim()) {
    return null;
  }

  const cleanGtmId = gtmId.trim();

  return (
    <>
      {/* Google Tag Manager Script */}
      <Script
        id={`gtm-script-${cleanGtmId}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'dataLayer','${cleanGtmId}');
          `,
        }}
      />
      {/* Google Tag Manager (noscript) Fallback */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${cleanGtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
