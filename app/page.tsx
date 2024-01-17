import { Browser } from "@/app/Browser";
import { formattedCode } from "@/app/formattedCode";
import { SECTIONS } from "@/app/snippets";
import { Code } from "@/components/typography/code";
import { Link } from "@/components/typography/link";

export default async function Home() {
  return (
    <main className="flex flex-col gap-8 px-4 max-w-screen-2xl mx-auto pb-4">
      <h1 className="text-4xl font-extrabold my-8 text-center">
        Prisma vs Convex
      </h1>
      <p>
        <Link href="https://www.prisma.io/client" target="_blank">
          Prisma Client examples
        </Link>{" "}
        translated to{" "}
        <Link href="https://convex.dev" target="_blank">
          Convex
        </Link>
        ,{" "}
        <Link
          href="https://www.npmjs.com/package/convex-helpers"
          target="_blank"
        >
          <Code>convex-helpers</Code>
        </Link>{" "}
        and{" "}
        <Link href="https://labs.convex.dev/convex-ents" target="_blank">
          Convex Ents
        </Link>
        .
      </p>
      <Browser
        sections={SECTIONS}
        formattedCodes={await formattedCode(SECTIONS)}
      />
    </main>
  );
}
