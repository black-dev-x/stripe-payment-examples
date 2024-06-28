import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import Stripe from 'stripe'
import "dotenv/config"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.post('/', c => {
  return c.text('Post Request from Hono!')
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
