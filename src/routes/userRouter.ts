import Elysia from "elysia";

const userRouter = new Elysia().group("/usersofSKH", (app) =>
  app
    .get("/", () => [{ name: "skhtas" }])
    .get("/:id", (req) => req.params.id)
    .post("/", (req) => req.body)
    .put("/:id", (req) => req.body)
    .delete("/:id", (req) => req.params.id)
);

export default userRouter;
