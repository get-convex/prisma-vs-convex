"use client";

import { CodeBlock } from "@/app/CodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Browser({
  sections,
  formattedCodes,
}: {
  sections: {
    [key: string]: { [key: string]: { prisma: string; convex: string }[] };
  };
  formattedCodes: [string, string, Record<string, string>][];
}) {
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState([
    Object.keys(sections)[0],
    Object.keys(Object.values(sections)[0])[0],
  ]);
  const [left, setLeft] = useState("prisma");
  const [right, setRight] = useState("convex");
  return (
    <div className="flex flex-col">
      <div className="flex justify-between sticky top-0 z-50 bg-background/90 py-4 gap-2">
        <div className="flex-grow">
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
        <VariantSelector value={left} onValueChange={setLeft} />
        <VariantSelector value={right} onValueChange={setRight} />
        <Toggle pressed={showAll} onPressedChange={() => setShowAll(!showAll)}>
          Show all
        </Toggle>
      </div>
      <div className="font-mono flex flex-col gap-8">
        {formattedCodes.map(([section, subsection, versions], i) => (
          <div
            key={i}
            className={cn(
              " grid-cols-2 gap-8 ",
              showAll || (section === selected[0] && subsection === selected[1])
                ? "grid"
                : "hidden"
            )}
          >
            <CodeBlock text={variant(versions, left)} />
            <div className="flex">
              <div className="flex-grow">
                <CodeBlock text={variant(versions, right)} />
              </div>
              <div className="w-0 overflow-hidden flex">
                {Object.keys(versions).map((key) => (
                  <CodeBlock key={key} text={versions[key]} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function variant(versions: Record<string, string>, variant: string) {
  return variant === "convex-helpers"
    ? versions[variant] ?? versions["convex"]
    : versions[variant] ?? "// Example not translated yet";
}

function VariantSelector({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="prisma">Prisma Client</SelectItem>
          <SelectItem value="convex">Convex Vanilla</SelectItem>
          <SelectItem value="convexHelpers">convex-helpers</SelectItem>
          <SelectItem value="convexEnts">Convex Ents</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
