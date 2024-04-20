import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: {
    JWT_SECRET: string
  },
  Variables: {
    prisma: any,
    userId: string
  }
}>()

blogRouter.use('/*', async (c, next) => {
  const authHeader = c.req.header("Authorization")
  if (!authHeader) {
    c.status(401)
    return c.json({ error: "unauthorized" })
  }

  // Bearer token => ["Bearer", "token"]
  const token = authHeader.split(" ")[1]

  try {
    const payload = await verify(token, c.env.JWT_SECRET)
    if (!payload.id) {
      c.status(401)
      return c.json({ error: "unauthorized" })
    }

    c.set('userId', payload.id)
    await next()
  } catch (err) {
    c.status(401)
    return c.json({ error: "unauthorized" })
  }
})


blogRouter.post('/', async (c) => {
  const prisma = c.get("prisma")
  const userId = c.get("userId")
  const body = await c.req.json()

  try {
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId
      }
    })
    return c.json({ id: blog.id })
  } catch (err) {
    c.status(411)
    return c.json({ error: "Error while creating blog" })
  }
})

blogRouter.put('/:blogId', async (c) => {
  const prisma = c.get("prisma")
  const userId = c.get("userId")
  const { blogId } = c.req.param()

  const body = await c.req.json()

  try {
    const blog = await prisma.blog.update({
      where: {
        id: blogId,
        authorId: userId
      },
      data: {
        title: body.title,
        content: body.content
      }
    })
    return c.json({ id: blog.id })
  } catch (err) {
    c.status(411)
    return c.json({ error: "Error while updating blog" })
  }
})

blogRouter.get('/bulk', async (c) => {
  const prisma = c.get("prisma")
  const userId = c.get("userId")

  try {
    const allBlogs = await prisma.blog.findMany({
      where: {
        authorId: userId
      }
    })
    return c.json({ allBlogs })
  } catch (err) {
    c.status(411)
    return c.json({ error: "Error white fetching all blogs" })
  }
})

blogRouter.get('/:blogId', async (c) => {
  const prisma = c.get("prisma")
  const userId = c.get("userId")
  const { blogId } = c.req.param()

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: blogId,
        authorId: userId
      }
    })
    return c.json({ blog })
  } catch (err) {
    c.status(411)
    return c.json({ error: "Error white fetching blog" })
  }
})