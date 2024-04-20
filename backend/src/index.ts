import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
  },
  Variables: {
    prisma: any
  }
}>()

//MIDDLEWARE
app.use('*', async (c, next) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  c.set('prisma', prisma)
  await next()
})

//ROUTER
app.route('/api/v1/user', userRouter)
app.route('/api/v1/blog', blogRouter)



export default app
