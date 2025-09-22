
'use client';

import { useEffect, useRef } from "react";

export default function LivePreview({ code }: { code: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        // A simple regex to extract content from a code block if present
        const match = /```(?:\w*\n)?([\s\S]*?)```/.exec(code);
        const codeToRender = match ? match[1] : code;
        doc.write(codeToRender);
        doc.close();
      }
    }
  }, [code]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin"
      className="w-full h-full border-0"
      title="Live Preview"
    />
  );
}
