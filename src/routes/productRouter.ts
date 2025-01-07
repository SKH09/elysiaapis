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
    async ({ body }) => {
      try {
        const { name, price, description, image, stock } = body;
        const product = await prisma.product.create({
          data: {
            name,
            price,
            description,
            image,
            stock,
          },
        });
        return product;
      } catch (error) {
        console.error("Validation error or Prisma error:", error);
      }
    },
    {
      body: t.Object({
        name: t.String(),
        price: t.Number({}),
        description: t.String(),
        image: t.String(),
        stock: t.Number(),
      }),
    }
  )
  .put(
    "/update/:id",
    async ({ body, params }) => {
      try {
        const { id } = params; // Extract product ID from URL params
        const { name, price, description, image, stock } = body;

        const updatedProduct = await prisma.product.update({
          where: { id: String(id) },
          data: {
            name,
            price,
            description,
            image,
            stock,
          },
        });

        return updatedProduct;
      } catch (error) {
        console.error("Error updating product:", error);
      }
    },
    {
      params: t.Object({
        id: t.String(), // Assuming `id` is passed as a string in the URL
      }),
      body: t.Object({
        name: t.String(), // Optional fields for partial updates
        price: t.Number(),
        description: t.String(),
        image: t.String(),
        stock: t.Number(),
      }),
    }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      try {
        const { id } = params; // Extract product ID from URL params

        const deletedProduct = await prisma.product.delete({
          where: {
            id,
          },
        });

        return deletedProduct;
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    },
    {
      params: t.Object({
        id: t.String(), // Assuming `id` is passed as a string in the URL
      }),
    }
  )

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
