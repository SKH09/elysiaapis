// import Elysia, { error } from "elysia";
// import Stripe from "stripe";

// export const webhook = new Elysia({}).post(
//   "/webhook",
//   async ({ body, headers }) => {
//     const stripeClient = new Stripe(Bun.env.STRIPE_SECRET_KEY as string, {
//       apiVersion: "2024-12-18.acacia",
//     });

//     const sig = headers["stripe-signature"];
//     let event;

//     try {
//       event = stripeClient.webhooks.constructEvent(
//         //@ts-ignore
//         body,
//         sig,
//         "whsec_4206b2a73c4bdef5703d857ece239599c6c16646d00a7498f3528222cdefa075"
//       );
//     } catch (err) {
//       return error(400, "bad request");
//     }
//     //Handle the event
//     switch (event.type) {
//       case "charge.succeeded":
//         const chargeSucceeded = event.data.object;
//         //Then define and call a function to handle the event charge.succeeded.
//         break;
//       case "payment_intent.created":
//         const paymentIntentCreated = event.data.object;
//         //Then define and call a function to handle the event payment_intent.created.
//         break;
//       case "payment_intent.succeeded":
//         const paymentIntentSucceeded = event.data.object;
//         //Then define and call a function to handle the event payment_intent.succeeded.
//         console.log("Payment completed!", paymentIntentSucceeded);
//         break;
//       //...handle other event types
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     return { received: true };
//   }
// );

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
