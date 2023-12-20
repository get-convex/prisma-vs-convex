"use client";

import { CodeBlock } from "@/app/CodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Browser({
  sections,
  formattedCodes,
}: {
  sections: {
    [key: string]: { [key: string]: { prisma: string; convex: string }[] };
  };
  formattedCodes: [string, string, string, string][];
}) {
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState([
    Object.keys(sections)[0],
    Object.keys(Object.values(sections)[0])[0],
  ]);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between">
        <div>
          <Tabs
            value={selected[0]}
            className={cn(showAll ? "opacity-0" : "opacity-100")}
          >
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
        <Toggle pressed={showAll} onPressedChange={() => setShowAll(!showAll)}>
          Show all
        </Toggle>
      </div>
      <div className="font-mono flex flex-col gap-8">
        {formattedCodes.map(([section, subsection, prisma, convex], i) => (
          <div
            key={i}
            className={cn(
              " grid-cols-2 gap-8 ",
              showAll || (section === selected[0] && subsection === selected[1])
                ? "grid"
                : "hidden"
            )}
          >
            <CodeBlock text={prisma.trim()} />
            <CodeBlock text={convex.trim()} />
          </div>
        ))}
      </div>
    </div>
  );
}
