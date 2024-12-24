import { Elysia, t } from "elysia";
import { prisma } from "../models/database";
import { password } from "bun";

const productRouter = new Elysia().group("/products", (app) =>
  app
    .get("/", async () => {
      const products = await prisma.product.findMany();
      return products;
    })
    .get(
      "/:id",
      async (req) => {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
          where: {
            id: id,
          },
        });
      },
      {
        params: t.Object({
          id: t.String(),
        }),
      }
    )
    .post(
      "/",
      async (req) => {
        const product = await prisma.product.create({
          data: {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            image: req.body.image,
            stock: req.body.stock,
          },
        });
        return product;
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
    .patch("/:id", async (req) => {
      const product = await prisma.product.update({
        where: {
          id: req.params.id,
        },
        data: {},
      });
    })
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
          price: t.Number(),
          description: t.String(),
          image: t.String(),
          stock: t.Number(),
        }),
      }
    )
    .delete("/:id", (req) => {
      return req.params.id;
    })
);

export default productRouter;
