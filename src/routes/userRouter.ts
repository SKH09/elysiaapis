import Elysia, { error, t } from "elysia";
import { prisma } from "../models/database";

export const userRouter = new Elysia({ prefix: "/users" })

  //getting all the users list
  .get("/list", async ({}) => {
    try {
      const users = await prisma.user.findMany();
      console.log("Users from database", users);
      return users;
    } catch (e) {
      return error(500, "Internal Server Error");
    }
  })

  //creating the users
  .post(
    "/create",
    async ({ body }) => {
      try {
        const { email, name, password, image } = body;

        console.log("received user data:", { email, name, password, image });
        const hashedPassword = await Bun.password.hash(password);
        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            image,
          },
        });
        return { user: newUser };
      } catch (e) {
        console.error("Error creating user:", e);
        return error(500, "Internal Server Error");
      }
    },
    {
      body: t.Object({
        name: t.String({
          minLength: 3,
          maxLength: 30,
        }),
        email: t.String({
          minLength: 3,
          maxLength: 30,
        }),
        password: t.String({
          minLength: 3,
          maxLength: 30,
        }),
        image: t.String({
          minLength: 1,
        }),
      }),
    }
  )

  //deleting the users
  .delete(
    "/:id",
    async ({ params }) => {
      try {
        const { id } = params;
        const deletedUser = await prisma.user.delete({
          where: {
            id,
          },
        });

        return deletedUser;
      } catch (e) {
        return error(500, "User is already deleted!");
      }
    },
    {
      params: t.Object({
        id: t.String({
          minLength: 3,
        }),
      }),
    }
  )

  //put or updating the user info: copy the id and go to the put router, paste it, rename the name and go to req
  .put(
    "/:id",
    async ({ body, params }) => {
      try {
        const { id } = params;
        const { name } = body;
        const newUser = await prisma.user.update({
          where: {
            id,
          },
          data: {
            name,
          },
        });
        const user = {
          name: newUser.name,
        };
        return user;
      } catch (e) {
        return error(500, "Internal Server Error");
      }
    },
    {
      body: t.Object({
        name: t.String({
          minLength: 3,
        }),
      }),

      params: t.Object({
        id: t.String({
          minLength: 3,
        }),
      }),
    }
  )

  .get("/profile", async ({}) => {
    return "user profile";
  });
