import * as prettier from "prettier";

export async function formattedCode(sections: {
  [key: string]: { [key: string]: { prisma: string; convex: string }[] };
}) {
  return (
    await Promise.all(
      Object.keys(sections).map(async (section) =>
        (
          await Promise.all(
            Object.keys(sections[section]).map(
              async (subsection) =>
                await Promise.all(
                  sections[section][subsection].map(
                    async ({ prisma, convex }) =>
                      [
                        section,
                        subsection,
                        await format(prisma),
                        await format(convex ?? ""),
                      ] as [string, string, string, string]
                  )
                )
            )
          )
        ).flat()
      )
    )
  ).flat();
}

async function format(text: string) {
  return await prettier.format(text, {
    parser: "typescript",
    printWidth: 65,
  });
}
