import Elysia, { error, t } from "elysia";
import { prisma } from "../models/database";
import jwt from "@elysiajs/jwt";

export const authRouter = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      secret: Bun.env.JWT_TOKEN as string,
    })
  )
  //creating the users
  .post(
    "/login",
    async ({ body, jwt }) => {
      try {
        const { email, password } = body;

        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        if (!user) {
          return error(401, "User not found");
        }

        const isPasswordCorrect = await Bun.password.verify(
          password,
          user?.password
        );

        if (!isPasswordCorrect) {
          return error(401, "Invalid password");
        }

        const token = await jwt.sign({
          sub: user.id,
        });

        return {
          token,
          user: {
            name: user.name,
            email: user.email,
            image: user.image,
          },
        };
      } catch (e) {
        return error(500, "Internal Server Error");
      }
    },
    {
      body: t.Object({
        email: t.String({
          minLength: 3,
          maxLength: 30,
        }),
        password: t.String({
          minLength: 3,
          maxLength: 30,
        }),
      }),
    }
  );
