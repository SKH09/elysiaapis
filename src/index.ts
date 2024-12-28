import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import { userRouter } from "./routes/userRouter";
import { productRouter } from "./routes/productRouter";
import { logger } from "@bogeychan/elysia-logger";
import { authPlugin } from "./middleware/authPlugin";
import { authRouter } from "./routes/authRouter";

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
  .listen(3000);
