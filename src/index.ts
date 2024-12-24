import { Elysia } from "elysia";
import productRouter from "./routes/productRouter";
import userRouter from "./routes/userRouter";
import swagger from "@elysiajs/swagger";
import { logger } from "@bogeychan/elysia-logger";

const app = new Elysia().get("/", () => "Hello Elysia");
app.use(swagger());
app.use(logger());
app.use(productRouter);
app.use(userRouter).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
