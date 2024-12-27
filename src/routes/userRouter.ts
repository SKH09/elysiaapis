import Elysia, { t } from "elysia";
import bcrypt from "bcrypt";
import { prisma } from "../models/database";
import jwt from "@elysiajs/jwt";
//skh@gmail.com
//pass@123
const userRouter = new Elysia().group("/users", (app) =>
  app
    .get("/", async () => {
      const users = await prisma.user.findMany();
      return users;
    })
    .get(
      "/:id",
      async (req) => {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
          where: {
            id: id,
          },
        });
        return user;
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
        const { email, image, name, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 6);
        const newUser = await prisma.user.create({
          data: {
            email,
            image,
            name,
            password: hashedPassword,
          },
        });
        return newUser;
      },
      {
        body: t.Object({
          name: t.String({
            minLength: 3,
            maxLength: 20,
          }),
          email: t.String({}),
          password: t.String({
            minLength: 3,
          }),
          image: t.String(),
        }),
      }
    )

    // .post(
    //   "/login",
    //   async ({ body, jwt, set }) => {
    //     try {
    //       const { email, password } = body;

    //       const user = await prisma.user.findUnique({
    //         where: {
    //           email,
    //         },
    //       });

    //       const isValidPassword = await bcrypt.compare(
    //         password,
    //         user?.password || ""
    //       );

    //       if (isValidPassword) {
    //         if (set.cookie) {
    //           const token = await jwt.sign(user?.email);
    //           console.log(set);
    //           console.log({ user });
    //           return {
    //             name: user?.name,
    //             email: user?.email,
    //             image: user?.image,
    //             id: user?.id,
    //           };
    //         }
    //         console.log("no cookie");
    //         return "no cookie";
    //       } else {
    //         return "login";
    //       }
    //     } catch (error) {}
    //   },

    //   {
    //     body: t.Object({
    //       email: t.String(),
    //       password: t.String(),
    //     }),
    //   }
    // );
    .post(
      "/login",
      async ({ body, jwt }) => {
        try {
          console.log("Login request received with body:", body);
    
          const { email, password } = body;
          if (!email || !password) {
            console.log("Missing email or password");
            return { error: "Email and password are required" };
          }
    
          const user = await prisma.user.findUnique({
            where: { email },
          });
    
          if (!user) {
            console.log("User not found for email:", email);
            return { error: "User not found" };
          }
    
          console.log("User found:", user);
    
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            console.log("Invalid password for user:", email);
            return { error: "Invalid password" };
          }
    
          const token = await jwt.sign({ email: user.email }, "your_secret_key");
    
          console.log("Token generated:", token);
    
          return {
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
          };
        } catch (error) {
          console.error("Error in /users/login endpoint:", error);
          return { error: "An error occurred during login" };
        }
      },
      {
        body: t.Object({
          email: t.String(),
          password: t.String(),
        }),
      }
    )
    

    .put("/:id", (req) => req.body)
    .delete("/:id", (req) => req.params.id)
);

export default userRouter;
