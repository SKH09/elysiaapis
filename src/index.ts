import { Elysia } from "elysia";
import productRouter from "./routes/productRouter";
import userRouter from "./routes/userRouter";
import swagger from "@elysiajs/swagger";
import { logger } from "@bogeychan/elysia-logger";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";

const app = new Elysia();

console.log(process.env.JWT_TOKEN);

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_TOKEN as string,
  })
);
app.get("/", () => {
  console.log(process.env.JWT_TOKEN);
  return "Hello Elysia!";
});
app.use(swagger());
app.use(logger());
app.use(productRouter);
app.use(userRouter).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
