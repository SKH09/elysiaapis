import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import { userRouter } from "./routes/userRouter";
import { productRouter } from "./routes/productRouter";
import { logger } from "@bogeychan/elysia-logger";
import { authRouter } from "./routes/authRouter";
import orderRouter from "./routes/orderRouter";



const app = new Elysia();

app.use(cors());

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
  .use(authRouter)
  .use(productRouter)
  .use(orderRouter)
  .listen(3000);
