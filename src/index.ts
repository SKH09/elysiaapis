import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import { userRouter } from "./routes/userRouter";
import { logger } from "@bogeychan/elysia-logger";
import { authRouter } from "./routes/authRouter";
import orderRouter from "./routes/orderRouter";
import { webhookRouter } from "./routes/webhook";
import { productRouter } from "./routes/productRouter";

const app = new Elysia();

app.use(cors()); // Enable CORS

app
  .use(logger())
  .use(
    swagger({
      path: "/swagger",
    })
  )
  .get("/", () => {
    return "Main Route";
  })

  .use(userRouter)
  .use(webhookRouter)
  .use(authRouter)
  .use(productRouter)
  .use(orderRouter)
  .listen(3000);
