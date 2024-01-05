import * as prettier from "prettier";

export async function formattedCode(sections: {
  [key: string]: { [key: string]: { [key in string]?: string }[] };
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
                    async (versions) =>
                      [
                        section,
                        subsection,
                        (
                          await Promise.all(
                            Object.keys(versions).map(async (key) => [
                              key,
                              await format(versions[key]!),
                            ])
                          )
                        ).reduce(
                          (formatted, [key, code]) => ({
                            ...formatted,
                            [key]: code,
                          }),
                          {}
                        ),
                      ] as [string, string, Record<string, string>]
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
  if (text.startsWith("\n")) {
    return text;
  }
  return (
    await prettier.format(text, {
      parser: "typescript",
      printWidth: 65,
    })
  ).trim();
}
