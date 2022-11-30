require("dotenv").config();

const e = require("express");
const express = require("express")
const app = express();
app.use(express.json())
app.use(express.static("public"))

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
	[1, {
		priceInCents: 10000,
		name: "Learn React Today"
	}],
	[2, {
		priceInCents: 20000,
		name: "Learn React Today"
	}]
])

app.post('/create-checkout-session', async function (req, res) {
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: req.body.items.Map(function (item) {
				const storeItem = storeItems.get(item.id);

				return {
					price_data: {
						currency: "usd",
						product_data: {
							name: storeItem.name
						},
						unit_amount: storeItem.priceInCents
					},
					quantity: item.quantity
				};
			}),
			mode: 'payment',
			success_url: `${process.env.SERVER_URL}/success.html`,
			cancel_url: `${process.env.SERVER_URL}/cancel.html`
		});

		res.json({
			url: session.url
		});

	} catch (error) {
		res.status(500).json({
			error: error.message
		});
	}
})

app.listen(3000)