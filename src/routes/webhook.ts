import Elysia, { error } from "elysia";
import Stripe from "stripe";
import { prisma } from "../models/database";

const stripe = new Stripe(Bun.env.STRIPE_SECRET_KEY as string, {});

const STRIPE_WEBHOOK_SECRET = Bun.env.STRIPE_WEBHOOK_SECRET!;

export const webhookRouter = new Elysia({ prefix: "/webhook" })

  .onParse(async ({ request }) => {
    const arrayBuffer = await Bun.readableStreamToArrayBuffer(request.body!);
    const rawBody = Buffer.from(arrayBuffer);
    return rawBody;
  })
  .post("/", async ({ request, body }) => {
    const signature = request.headers.get("stripe-signature");
    console.log(STRIPE_WEBHOOK_SECRET, "webhook");
    if (!signature) {
      throw new Error("No signature provided");
    }
    let event: Stripe.Event;
    console.log({ signature });

    try {
      event = await stripe.webhooks.constructEventAsync(
        body as Buffer,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.log("Webhook signature verification failed:", error);
      throw new Error(`Webhook Error: `);
    }

    try {
      switch (event.type) {
        //case when charge succeeded
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;

          // Find booking by payment intent ID
          const booking = await prisma.order.findFirst({
            where: {
              paymentIntentId: paymentIntent.id,
            },
          });
          if (!booking) {
            throw new Error(
              `No booking found for payment intent ${paymentIntent.id}`
            );
          }

          // Update booking status

          await prisma.order.update({
            where: {
              id: booking.id,
            },
            data: {
              paymentStatus: "PAID",
            },
          });
          console.log(`Payment succeeded for booking ${booking.id}`);
          break;
        }
        //case when failed
        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;

          const booking = await prisma.order.findFirst({
            where: {
              paymentIntentId: paymentIntent.id,
            },
          });
          if (!booking) {
            throw new Error(
              `No booking found for payment intent ${paymentIntent.id}`
            );
          }

          // Update booking status
          await prisma.order.update({
            where: {
              id: booking.id,
            },
            data: {
              paymentStatus: "FAILED",
            },
          });

          console.log(`Payment failed for booking ${booking.id}`);
          break;
        }
        //case when action required
        case "payment_intent.requires_action": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;

          const booking = await prisma.order.findFirst({
            where: {
              paymentIntentId: paymentIntent.id,
            },
          });
          if (booking) {
            await prisma.order.update({
              where: {
                id: booking.id,
              },
              data: {
                paymentStatus: "PENDING",
              },
            });
          }
          break;
        }
        //case when cancelled
        case "payment_intent.canceled": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;

          const booking = await prisma.order.findFirst({
            where: {
              paymentIntentId: paymentIntent.id,
            },
          });

          if (booking) {
            await prisma.order.update({
              where: {
                id: booking.id,
              },
              data: {
                paymentStatus: "FAILED",
              },
            });
          }
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (err) {
      console.error("Error processing webhook:", err);
      // @ts-ignore
      throw new Error(`Webhook handler failed: ${err.message}`);
    }
  });
