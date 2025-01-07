import Elysia, { error, t } from "elysia";
import { prisma } from "../models/database";
import { authPlugin } from "../middleware/authPlugin";

export const productRouter = new Elysia({ prefix: "/products" })
  .get("", async ({}) => {
    const products = await prisma.product.findMany({});
    return products;
  })
  // .post(
  //   "/create",
  //   async (req) => {
  //     const product = await prisma.product.create({
  //       data: {
  //         name: req.body.name,
  //         price: req.body.price,
  //         description: req.body.description,
  //         image: req.body.image,
  //         stock: req.body.stock,
  //       },
  //     });
  //     console.log("product created", product);
  //     return product;
  //   },
  //   {
  //     body: t.Object({
  //       name: t.String(),
  //       price: t.Number({
  //         minimum: 100,
  //         maximum: 200,
  //       }),
  //       description: t.String(),
  //       image: t.String(),
  //       stock: t.Number(),
  //     }),
  //   }
  // )

  .post(
    "/create",
    async (req) => {
      try {
        const product = await prisma.product.create({
          data: {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            image: req.body.image,
            stock: req.body.stock,
          },
        });
      } catch (error) {
        console.error("Validation error or Prisma error:", error);
      }
    },
    {
      body: t.Object({
        name: t.String(),
        price: t.Number({
          minimum: 100,
          maximum: 200,
        }),
        description: t.String(),
        image: t.String(),
        stock: t.Number(),
      }),
    }
  )
  .put(
    "/:id",
    async (req) => {
      const productInfo = req.body;
      const productId = req.params.id;
      const updatedProduct = await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          name: productInfo.name,
          price: productInfo.price,
          description: productInfo.description,
          image: productInfo.image,
          stock: productInfo.stock,
        },
      });
      return updatedProduct;
    },
    {
      body: t.Object({
        name: t.String(),
        price: t.Number({
          minimum: 100,
          maximum: 2000,
        }),
        description: t.String(),
        image: t.String(),
        stock: t.Number(),
      }),
    }
  )
  .delete("/:id", (req) => {
    return req.params.id;
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
