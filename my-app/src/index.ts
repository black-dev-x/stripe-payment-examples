import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import Stripe from 'stripe'
import "dotenv/config"
import { HTTPException } from 'hono/http-exception'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const app = new Hono()

app.post('/', c => {
  return c.text('Post Request from Hono!')
})
app.post('/checkout', async (c) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_this_is_a_price_id_from_the_dashboard',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    })
    // the json has a lot of information, but the most important thing, is actually a url
    // that we can redirect the user to, to complete the payment
    return c.json(session)
  } catch(error: any) {
    throw new HTTPException(500, { message: error.message })
  }
})

app.get('/success', (c) => {
  return c.text('Payment Successful!')
})

app.get('/cancel', (c) => {
  return c.text('Payment Cancelled!')
})

app.get('/', c => {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Checkout</title>
    <script src="https://js.stripe.com/v3/"></script>
  </head>
  <body>
    <h1>Checkout</h1>
    <button id="checkoutButton">Checkout</button>

    <script>
      const checkoutButton = document.getElementById('checkoutButton');
      checkoutButton.addEventListener('click', async () => {
        const response = await fetch('/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const {id} = await response.json();
        const stripe = Stripe('${process.env.STRIPE_PUBLISHABLE_KEY}');
        await stripe.redirectToCheckout({sessionId: id});
      });
    </script>
  </body>
</html>
`
  return c.html(html)
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
