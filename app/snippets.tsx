export const SECTIONS = {
  "Reading Data": {
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
const user = await prisma.user.findUnique({
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
const user = {name, email}`,
      },
    ],
    "Traverse Relations": [
      {
        prisma: `// Retrieve the posts of a user
const postsByUser: Post[] = await prisma.user
  .findUnique({ where: { email: 'ada@prisma.io' } })
  .posts()`,
        convex: `// Retrieve the posts of a user
const user = (await ctx.db.query("users").withIndex("email", q=>
q.eq("email", "ada@prisma.io")).unique());
if (user === null) {
  throw new Error("User not found")
}
const postsByUser = await ctx.db.query("posts").withIndex("authorId", q=>
q.eq("authorId", user._id)).collect()`,
      },
      {
        prisma: `// Retrieve the categories of a post
const categoriesOfPost: Category[] = await prisma.post
  .findUnique({ where: { id: 1 } })
  .categories()`,
        convex: `// Retrieve the categories of a post
        const post = await ctx.db.get(postId)
        if (post === null) {
          throw new Error("Post not found")
        }
        const categoriesOfPost = await ctx.db.query("categories").withIndex("postId", q=>
        q.eq("postId", post._id)).collect()`,
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
        const users = await Promise.all((await ctx.db.query("users").collect())
          .map(async user => ({
            ...user,
            posts: await ctx.db.query("posts").withIndex("authorId", q=>
            q.eq("authorId", user._id)).collect(),
            profile: await ctx.db.query("profiles").withIndex("userId", q=>
            q.eq("userId", user._id)).unique(),
          })))`,
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
        const userPosts = await Promise.all((await ctx.db.query("users").collect()).map(async user => ({
          ...user,
          posts: (await ctx.db.query("posts").withIndex("authorId", q=>
          q.eq("authorId", user._id)).collect()).map(({title}) => title),
          })))`,
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
              _count: 'desc',
            },
          },
        })`,
        convex: `// Order by most prolific authors
        const prolificAuthors = await ctx.db.query("users").withIndex("postCount").order("desc").collect()`,
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
        const count = (await ctx.db.query("users").collect()).length
        
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
        const groupUsers = (await ctx.db.query("users").collect()).reduce(
          (counts, { country }) => ({
            ...counts,
            [country]: counts[country] ?? 0 + 1,
          }),
          {} as Record<string, number>
        )

        // imperative if you prefer
        const groupUsers = {}
        for (const {country} of await ctx.db.query("users").collect()) {
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
        const usersByCountry = (await ctx.db.query("users").collect()).reduce(
          (counts, user) => ({
            ...groups,
            [user.country]: [...(groups[user.country] ?? []), user],
          }),
          {} as Record<string, Doc<"users">[]>
        ).filter(group => group.length > 3)`,
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
      {
        prisma: `// Change the author of a post in a single transaction
        const updatedPost: Post = await prisma.post.update({
          where: {
            id: 2,
          },
          data: {
            author: {
              connect: {
                email: 'alice@prisma.io',
              },
            },
          },
        })`,
        convex: `// Change the author of a post in a single transaction
        const post = await ctx.db.get(id)
        if (post === null) {
          throw new Error("Post not found")
        }
        const author = await ctx.db.query("users").withIndex("email", q=>
        q.eq("email", "alice@prisma.io")).unique();
        if (author === null) {
          throw new Error("Author not found")
        }
        await ctx.db.patch(post._id, { authorId: author._id })`,
      },
      {
        prisma: `// Connect a post to a user, creating the post if it isn't found
        const updatedUser: User = await prisma.user.update({
          where: {
            id: 1,
          },
          data: {
            posts: {
              connectOrCreate: {
                create: {
                  title: 'The Gray Gatsby',
                },
                where: {
                  id: 10,
                },
              },
            },
          },
        })`,
        convex: `// Connect a post to a user, creating the post if it isn't found
        const user = await ctx.db.get(userId)
        if (user === null) {
          throw new Error("User not found")
        }
        const post = await ctx.db.get(postId)
        if (post === null) {
          await ctx.db.insert("posts", {
            title: 'The Gray Gatsby',
            authorId: user._id
          })
        }`,
      },
      {
        prisma: `// Update all users with the country Deutschland
        const updatedUsers: Prisma.BatchPayload = await prisma.user.updateMany({
          data: {
            country: 'Germany',
          },
          where: {
            country: 'Deutschland',
          },
        })`,
        convex: `// Update all users with the country Deutschland
        const users = await ctx.db.query("users").withIndex("country", q=>
        q.eq("country", "Deutschland")).collect()
        await Promise.all(users.map(user => ctx.db.patch(user._id, {country: 'Germany'})))`,
      },
    ],
    "Delete Records": [
      {
        prisma: `// Delete an existing user
        const deletedUser: User = await prisma.user.delete({
          where: {
            email: 'alice@prisma.io',
          },
        })`,
        convex: `// Delete an existing user
        const deletedUser = await ctx.db.query("users").withIndex("email", q=>
        q.eq("email", "alice@prisma.io")).unique()
        await ctx.db.delete(deletedUser._id)`,
      },
      {
        prisma: `// Delete all the admins at once
        const deletedAdmins: Prisma.BatchPayload = await prisma.user.deleteMany({
          where: {
            role: 'ADMIN',
          },
        })`,
        convex: `// Delete all the admins at once
        const deletedAdmins = await ctx.db.query("users").withIndex("role", q=>
        q.eq("role", "ADMIN")).collect()
        await Promise.all(deletedAdmins.map(user => ctx.db.delete(user._id)))`,
      },
    ],
    "Upsert Records": [
      {
        prisma: `// Create Alice or update her role to admin.
        const alice: User = await prisma.user.upsert({
          update: {
            role: 'ADMIN',
          },
          where: {
            email: 'alice@prisma.io',
          },
          create: {
            name: 'Alice',
            email: 'alice@prisma.io',
            country: 'England',
            role: 'ADMIN',
            age: 43,
          },
        })`,
        convex: `// Create Alice or update her role to admin.
        let alice = await ctx.db.query("users").withIndex("email", q=>
        q.eq("email", "alice@prisma.io")).unique()
        if (alice !== null) {
          await ctx.db.patch(alice._id, {role: 'ADMIN'})
        } else {
          const id = await ctx.db.insert("users", {
            name: 'Alice',
            email: 'alice@prisma.io',
            country: 'England',
            role: 'ADMIN',
            age: 43,
          });
          alice = await ctx.db.get(id)
        }`,
      },
    ],
  },
  "Advanced Patterns": {
    Transactions: [
      {
        prisma: `// Create Bob and update Carol as a batch within a transaction
        await prisma.$transaction([
          prisma.user.create({
            data: {
              name: 'Bob',
              email: 'bob@prisma.io',
              age: 49,
              country: 'USA',
            },
          }),
          prisma.user.update({
            where: {
              email: 'carol@prisma.io',
            },
            data: {
              country: 'Germany',
            },
          }),
        ])`,
        convex: `// Create Bob and update Carol as a batch within a transaction
        await ctx.db.insert("users", {
          name: 'Bob',
          email: 'bob@prisma.io',
          age: 49,
          country: 'USA',
        });
        const carol = await ctx.db.query("users").withIndex("email", q=>
        q.eq("email", "carol@prisma.io")).unique()
        if (carol === null) {
          throw new Error("Carol not found")
        }
        await ctx.db.patch(carol._id, {country: 'Germany'})`,
      },
      {
        prisma: `// Example function turning an email into a country
        const locate = async (email: string) => ({ country: 'Germany' })
        const geo = await locate(bob.email)
        return await tx.user.update({
            where: {
              id: bob.id,
            },
            data: {
              country: geo.country,
            },
          })
    `,
        convex: `// Example function turning an email into a country
        const locate = async (email: string) => ({ country: 'Germany' })
        const geo = await locate(bob.email)
        await ctx.db.patch(bob._id, {country: geo.country})`,
      },
    ],
    // These are weird examples
    // Middleware: [
    //   {
    //     prisma: `// Timing middleware
    //     prisma.$use(async (params, next) => {
    //       const before = Date.now()
    //       const result = await next(params)
    //       const after = Date.now()
    //       console.log(
    //         \`Query \${params.model}.\${params.action} took \${after - before}ms\`,
    //       )
    //       return result
    //     })`,
    //     convex: `// Timing middleware
    //     // :(`,
    //   },
    // ],
  },
  Schema: {
    "Data Model": [
      {
        prisma: `
// This is your Prisma schema file. Learn more in the
// documentation: https://pris.ly/d/prisma-schema

datasource db {
  provider = "postgres"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["interactiveTransactions"]
}

model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  email     String   @unique
  name      String
  age       Int
  role      Role     @default(USER)
  country   String
  posts     Post[]
  profile   Profile?
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique
}

model Post {
  id         Int        @id @default(autoincrement())
  createdAt  DateTime   @default(now())
  title      String
  published  Boolean    @default(false)
  categories Category[] @relation(references: [id])
  author     User       @relation(fields: [authorId], references: [id])
  authorId   Int
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[] @relation(references: [id])
}

enum Role {
  USER
  ADMIN
}
`,
        convex: `// This is your optional Convex schema.
        import { defineSchema, defineTable } from "convex/server";
        import { v } from "convex/values";
        
        export default defineSchema({
          users: defineTable({
            email: v.string(),
            name: v.string(),
            age: v.int64(),
            role: v.union(v.literal("USER"), v.literal("ADMIN")),
            country: v.string(),
          }).index("email", ["email"]),

          profiles: defineTable({
            bio: v.string(),
            userId: v.id("users"),
          }).index("userId", ["userId"]),

          posts: defineTable({
            title: v.string(),
            published: v.bool(),
            authorId: v.id("users"),
          }).index("authorId", ["authorId"]),

          categories: defineTable({
            name: v.string(),
          }),

          postsToCategories: defineTable({
            postId: v.id("posts"),
            categoryId: v.id("categories"),
          })
            .index("postId", ["postId"])
            .index("categoryId", ["categoryId"]),
        });
        `,
      },
    ],
  },
};
