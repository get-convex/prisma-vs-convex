"use client";

import { AfterSSR } from "@/components/helpers/AfterSSR";
import { useEffect, useState } from "react";
import {
  CodeBlock as CodeBlockBase,
  atomOneDark,
  atomOneLight,
} from "react-code-blocks";

export function CodeBlock({ text }: { text: string }) {
  return (
    <AfterSSR>
      <div>
        <div className="rounded-lg overflow-hidden border">
          <CodeBlockInner text={text} />
        </div>
      </div>
    </AfterSSR>
  );
}

function CodeBlockInner({ text }: { text: string }) {
  const isDarkMode = useDarkMode();
  return (
    <CodeBlockBase
      text={text}
      theme={isDarkMode ? atomOneDark : atomOneLight}
      language="typescript"
    />
  );
}

function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isDarkMode;
}

export default useDarkMode;
