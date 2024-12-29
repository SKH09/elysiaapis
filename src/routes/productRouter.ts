import Elysia, { error, t } from "elysia";
import { prisma } from "../models/database";
import { authPlugin } from "../middleware/authPlugin";

export const productRouter = new Elysia({ prefix: "/products" })
  .get("", async ({}) => {
    const products = await prisma.product.findMany({});
    return products;
  })
  .use(authPlugin)
  .get(
    "/:id",
    async ({ params, ...request }) => {
      try {
        console.log(request, "request");
        const { id } = params;
        console.log({ id });
        const product = await prisma.product.findFirst({
          where: {
            id: id,
          },
        });

        console.log("finding the product....");
        console.log(product, "product");
        return { product };
      } catch (e) {
        return error(500, e);
      }
    },
    {
      params: t.Object({
        id: t.String({
          minLength: 1,
        }),
      }),
    }
  );
