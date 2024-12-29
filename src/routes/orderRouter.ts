import Elysia, { t } from "elysia";
import { authPlugin } from "../middleware/authPlugin";
import { prisma } from "../models/database";
import { nanoid } from "nanoid";
import Stripe from "stripe";
//user token - eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0ODM4YzY2MS1jOTM5LTQxMDItYjQ0Mi03OWY2MWRiMzA2N2EifQ.T1m7GHyl7W4SW466W4OhVGhq4x8cUUpihoEGAN5F-bE

const stripeClient = new Stripe(Bun.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
});

export const orderRouter = new Elysia({ prefix: "/orders" })
  .use(authPlugin)
  .post(
    "/",
    async ({ user, body }) => {
      console.log(body);
      console.log("loggin the body");
      const { orderItems, deliveryAddress, totalPrice } = body;
      const orderId = "order_" + nanoid();
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: totalPrice * 100,
        currency: "usd",
      });

      const order = await prisma.order.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          id: orderId,
          deliveryAddress,
          deliveryStatus: "PENDING",
          totalPrice: totalPrice,
          paymentDetails: {
            amount: paymentIntent.amount,
          },
          paymentIntentId: paymentIntent.id,
          paymentStatus: "PENDING",
        },
      });
      const __orderItems = await prisma.orderItem.createMany({
        data: orderItems.map((orderItem) => {
          return {
            orderId,
            productId: orderItem.productId,
            quantity: orderItem.quantity,
            price: orderItem.price,
          };
        }),
      });

      return {
        order,
        clientSecret: paymentIntent.client_secret,

      };
    },
    {
      body: t.Object({
        deliveryAddress: t.String(),
        totalPrice: t.Number(),
        orderItems: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number(),
            price: t.Number(),
          })
        ),
      }),
    }
  )

  .get("/orders", async ({ user }) => {
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
    });
    return orders;
  });

export default orderRouter;
