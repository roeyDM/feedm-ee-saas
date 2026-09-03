import { GoogleTagManager } from "@next/third-parties/google";

interface GTMScriptProps {
  gtmId?: string;
}

export function GTMScript({ gtmId }: GTMScriptProps) {
  if (!gtmId || !gtmId.trim()) {
    return null;
  }

  return <GoogleTagManager gtmId={gtmId.trim()} />;
}
