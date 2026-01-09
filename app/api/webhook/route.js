import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updatePaymentStatus } from '../../_lib/data-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

export async function POST(req) {
  const sig = req.headers.get('stripe-signature') ?? '';

  let event;
  try {
    // Use raw bytes for reliable verification
    const rawBody = Buffer.from(await req.arrayBuffer());

    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;

        const { orderId } = paymentIntent.metadata;

        if (!orderId) {
          console.error('Missing orderId');
          break;
        }

        let billingAddress = null;

        if (paymentIntent.latest_charge) {
          const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
          billingAddress = charge.billing_details?.address || null;
        } else {
          console.log('No charge yet (rare for immediate successes)');
        }

        // Your existing status update
        await updatePaymentStatus({ orderId, billingAddress, paymentStatus: event.type });

        break;
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
