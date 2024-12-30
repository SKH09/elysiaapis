import Elysia, { error } from "elysia";
import Stripe from "stripe";

export const webhook = new Elysia({}).post(
  "/webhook",
  async ({ body, headers }) => {
    const stripeClient = new Stripe(Bun.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2024-12-18.acacia",
    });

    const sig = headers["stripe-signature"];
    let event;

    try {
      event = stripeClient.webhooks.constructEvent(
        //@ts-ignore
        body,
        sig,
        "whsec_4206b2a73c4bdef5703d857ece239599c6c16646d00a7498f3528222cdefa075"
      );
    } catch (err) {
      return error(400, "bad request");
    }
    //Handle the event
    switch (event.type) {
      case "charge.succeeded":
        const chargeSucceeded = event.data.object;
        //Then define and call a function to handle the event charge.succeeded.
        break;
      case "payment_intent.created":
        const paymentIntentCreated = event.data.object;
        //Then define and call a function to handle the event payment_intent.created.
        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        //Then define and call a function to handle the event payment_intent.succeeded.
        console.log("Payment completed!", paymentIntentSucceeded);
        break;
      //...handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }
);
