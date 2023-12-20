import { Browser } from "@/app/Browser";
import { formattedCode } from "@/app/formattedCode";

const SECTIONS = {
  "Reading data": {
    "Find Records": [
      {
        prisma: `// Find all posts
const allPosts: Post[] = await prisma.post.findMany()`,
        convex: `// Find all posts
const allPosts = ctx.db.query("posts").collect()`,
      },
      {
        prisma: `// Find a user by ID
const userById: User | null = await prisma.user.findUnique({
  where: {
    id: 2,
  },
})`,
        convex: `// Find a user by ID
const userById = ctx.db.get(id)`,
      },
      {
        prisma: `// Find the first user that contains Ada
const userByName = await prisma.user.findFirst({
  where: {
    name: {
      contains: 'Ada',
    },
  },
})`,
        convex: `// Find the first user that contains Ada
const userByName = await ctx.db.query("users").withSearchIndex("name", q=>
q.search("name", "Ada")).first();`,
      },
      {
        prisma: `// Select specific fields
const userName = await prisma.user.findUnique({
  where: {
    email: 'ada@prisma.io',
  },
  select: {
    name: true,
    email: true,
  },
})`,
        convex: `// Select specific fields
const {name, email} = (await ctx.db.query("users").withIndex("email", q=>
q.eq("email", "ada@prisma.io")).unique()) ?? {};
const userName = {name, email}`,
      },
    ],
    "Traverse Relations": [
      {
        prisma: `// Retrieve the posts of a user
const postsByUser: Post[] = await prisma.user
  .findUnique({ where: { email: 'ada@prisma.io' } })
  .posts()`,
        convex: `// Retrieve the posts of a user
const postsByUser = (await ctx.db.query("users").withIndex("email", q=>
q.eq("email", "ada@prisma.io")).unique());
//...??...`,
      },
      {
        prisma: `// Retrieve the categories of a post
const categoriesOfPost: Category[] = await prisma.post
  .findUnique({ where: { id: 1 } })
  .categories()`,
        convex: `// Retrieve the categories of a post
        //...??...`,
      },
      {
        prisma: `// Retrieve the profile of a user via a specific post
const authorProfile: Profile | null = await prisma.post
  .findUnique({ where: { id: 1 } })
  .author()
  .profile()`,
        convex: `// Retrieve the profile of a user via a specific post
const post = await ctx.db.get(id);
const author = post=== null ? null: await ctx.db.get(post.authorId)
const authorProfile = author===null?null: await ctx.db.get(author.profileId)`,
      },
      {
        prisma: `// Return all users and include their posts and profile
        const users: User[] = await prisma.user.findMany({
          include: {
            posts: true,
            profile: true,
          },
        })`,
        convex: `// Return all users and include their posts and profile
        //...??...`,
      },
      {
        prisma: `// Select all users and all their post titles
        const userPosts = await prisma.user.findMany({
          select: {
            name: true,
            posts: {
              select: {
                title: true,
              },
            },
          },
        })`,
        convex: `// Select all users and all their post titles
        //...??...`,
      },
    ],
    "Order By, Limits & Cursors": [
      {
        prisma: `// Sort posts alphabetically
        const alphabeticPosts: Post[] = await prisma.post.findMany({
          orderBy: { title: 'asc' },
        })`,
        convex: `// Sort posts alphabetically
        const alphabeticPosts = await ctx.db.query("posts").withIndex("title").collect()`,
      },
      {
        prisma: `// Order by most prolific authors
        const prolificAuthors: Category[] = await prisma.user.findMany({
          orderBy: {
            posts: {
              _count: 'asc',
            },
          },
        })`,
        convex: `// Order by most prolific authors
        const prolificAuthors = await ctx.db.query("users").withIndex("postCount").collect()`,
      },
      {
        prisma: `// Find the second page of posts
        const secondPagePosts: Post[] = await prisma.post.findMany({
          take: 5,
          skip: 5,
        })`,
        convex: `// Find the second page of posts
        const firstPagePosts = await ctx.db.query("posts").paginate({numItems: 5})
        const secondPagePosts =  await ctx.db.query("posts").paginate({cursor: firstPagePosts.cursor, numItems: 5})`,
      },
      {
        prisma: `// Find the last 5 posts
        const lastPosts: Post[] = await prisma.post.findMany({
          take: -5,
        })`,
        convex: `// Find the last 5 posts
        const lastPosts = await ctx.db.query("posts").order("desc").take(5)`,
      },
    ],
    "Aggregates & Group By": [
      {
        prisma: `// Count the number of users
        const count = await prisma.user.count()`,
        convex: `// Count the number of users - small numbers
        const count = (await ctx.db.query("users")).length
        
        // Count the number of users - big numbers
        const count = await ctx.db.get(userCounterId)`,
      },
      {
        prisma: `// Average age of our users
        const averageAge = await prisma.user.aggregate({
          _avg: {
            age: true,
          },
        })`,
        convex: `// Average age of our users
        const users = await ctx.db.query("users")
        const averageAge = users.reduce((acc, user) => acc + user.age, 0) / users.length`,
      },
      {
        prisma: `// Group users by country
        const groupUsers = await prisma.user.groupBy({
          by: ['country'],
          _count: {
            id: true,
          },
        })`,
        convex: `// Group users by country
        const groupUsers = (await ctx.db.query("users")).reduce(
          (counts, { country }) => ({
            ...counts,
            [country]: counts[country] ?? 0 + 1,
          }),
          {} as Record<string, number>
        )

        // imperative if you prefer
        const groupUsers = {}
        for (const {country} of await ctx.db.query("users")) {
          groupUsers[country] ??= 0
          groupUsers[country]++
        }`,
      },
      {
        prisma: `// Group users by country with more than 3 users.
        const usersByCountry = await prisma.user.groupBy({
          by: ['country'],
          _count: {
            country: true,
          },
          having: {
            country: {
              _count: {
                gt: 3,
              },
            },
          },
        })`,
        convex: `// Group users by country with more than 3 users.
// ...`,
      },
    ],
  },
  "Writing data": {
    "Create Records": [
      {
        prisma: `// Create a user
        const user: User = await prisma.user.create({
          data: {
            email: 'elsa@prisma.io',
            name: 'Elsa Prisma',
            country: 'Italy',
            age: 30,
          },
        })`,
        convex: `// Create a user
        const userId = await ctx.db.insert("users", {
          email: 'elsa@prisma.io',
            name: 'Elsa Prisma',
            country: 'Italy',
            age: 30,})
        const user = await ctx.db.get(userId)`,
      },
      {
        prisma: `// Create a user and two posts
        const userWithPosts: User = await prisma.user.create({
          data: {
            email: 'elsa@prisma.io',
            name: 'Elsa Prisma',
            country: 'Italy',
            age: 30,
            posts: {
              create: [
                {
                  title: 'Include this post!',
                },
                {
                  title: 'Include this post!',
                },
              ],
            },
          },
        })`,
        convex: `// Create a user and two posts
        const userId = await ctx.db.insert("users", {
          email: 'elsa@prisma.io',
            name: 'Elsa Prisma',
            country: 'Italy',
            age: 30,})
        const postIds = await Promise.all([
        ctx.db.insert("posts", {
          title: 'Include this post!',
          authorId: userId
        }),
        ctx.db.insert("posts", {
          title: 'Include this post!',
          authorId: userId
        })])
        const userWithPosts = {...await ctx.db.get(userId),
          posts: Promise.all(postIds.map(ctx.db.get))}`,
      },
      {
        prisma: `// Create many users at once
        const users: Prisma.BatchPayload = await prisma.user.createMany({
          data: [
            {
              name: 'Bob',
              email: 'bob@prisma.io',
              country: 'USA',
              age: 24,
            },
            {
              name: 'Yewande',
              email: 'yewande@prisma.io',
              country: 'Zimbabwe',
              age: 19,
            },
            {
              name: 'Angelique',
              email: 'angelique@prisma.io',
              country: 'Greece',
              age: 43,
            },
          ],
        })`,
        convex: `// Create many users at once
        const userIds = await Promise.all([
          {
            name: 'Bob',
            email: 'bob@prisma.io',
            country: 'USA',
            age: 24,
          },
          {
            name: 'Yewande',
            email: 'yewande@prisma.io',
            country: 'Zimbabwe',
            age: 19,
          },
          {
            name: 'Angelique',
            email: 'angelique@prisma.io',
            country: 'Greece',
            age: 43,
          },
        ].map(data => ctx.db.insert("users", data)))`,
      },
    ],
    "Update Records": [
      {
        prisma: `// Update an existing user
        const alice: User = await prisma.user.update({
          data: {
            role: 'ADMIN',
          },
          where: {
            email: 'alice@prisma.io',
          },
        })`,
        convex: `// Update an existing user
        const alice = await ctx.db.query("users").withIndex("email", q=>
        q.eq("email", "ada@prisma.io")).unique()
        if (alice === null) {
          throw new Error("User not found")
        }
        await ctx.db.patch(alice._id, { role: 'ADMIN', })`,
      },
    ],
  },
};

export default async function Home() {
  return (
    <main className="flex flex-col gap-8 px-4">
      <h1 className="text-4xl font-extrabold my-8 text-center">
        Convex vs Prisma
      </h1>
      <Browser
        sections={SECTIONS}
        formattedCodes={await formattedCode(SECTIONS)}
      />
    </main>
  );
}
