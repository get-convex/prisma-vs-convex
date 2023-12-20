"use client";

import { CodeBlock } from "@/app/CodeBlock";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Browser({
  sections,
  formattedCodes,
}: {
  sections: {
    [key: string]: { [key: string]: { prisma: string; convex: string }[] };
  };
  formattedCodes: [string, string, string, string][];
}) {
  const [selected, setSelected] = useState([
    Object.keys(sections)[0],
    Object.keys(Object.values(sections)[0])[0],
  ]);
  console.log(selected);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Tabs value={selected[0]}>
          <TabsList>
            {Object.keys(sections).map((section) => (
              <TabsTrigger
                key={section}
                value={section}
                onClick={() =>
                  setSelected([section, Object.keys(sections[section])[0]])
                }
              >
                {section}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(sections).map((section) => (
            <TabsContent key={section} value={section}>
              <Tabs value={selected[1]}>
                <TabsList>
                  {Object.keys(sections[section]).map((subsection) => (
                    <TabsTrigger
                      key={subsection}
                      value={subsection}
                      onClick={() => setSelected([section, subsection])}
                    >
                      {subsection}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <div className="font-mono flex flex-col gap-8">
        {formattedCodes.map(([section, subsection, prisma, convex], i) => (
          <div
            key={i}
            className={cn(
              " grid-cols-2 gap-8 ",
              section === selected[0] && subsection === selected[1]
                ? "grid"
                : "hidden"
            )}
          >
            <CodeBlock text={prisma} />
            <CodeBlock text={convex} />
          </div>
        ))}
      </div>
    </div>
  );
}
