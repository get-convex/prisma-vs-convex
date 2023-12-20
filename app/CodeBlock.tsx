"use client";

import { AfterSSR } from "@/components/helpers/AfterSSR";
import { CodeBlock as CodeBlockBase, atomOneDark } from "react-code-blocks";

export function CodeBlock({ text }: { text: string }) {
  return (
    <AfterSSR>
      <CodeBlockBase text={text} theme={atomOneDark} language="typescript" />
    </AfterSSR>
  );
}
