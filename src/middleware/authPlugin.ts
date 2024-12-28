import Elysia, { error } from "elysia";
import jwt from "@elysiajs/jwt";
import { prisma } from "../models/database";

console.log(Bun.env.JWT_TOKEN, "token");

export const authPlugin = (app: Elysia) =>
  app.use(
      jwt({
        secret: Bun.env.JWT_TOKEN as string,
      })
    )
    .derive(async ({ jwt, headers, set }) => {
      if (!jwt) {
        return error(401, "JWT is not available");
      }

      const authorization = headers.authorization;
      if (!authorization?.startsWith("Bearer ")) {
        return error(401, "Unauthorized");
      }

      const token = authorization.slice(7);
      const payload = await jwt.verify(token);
      if (!payload) {
        return error(401, "Unauthorized");
      }

      console.log(payload, "payload");

      const user = await prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });
      if (!user) {
        return error(401, "Unauthorized User");
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      };
    });
