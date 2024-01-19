const apiRouter = require("express").Router();
const {
  getAllTopics,
  getAllArticles,
  getAllUsers,
} = require("../controllers/app.controller");
const articleRouter = require("./article-router");
const commentRouter = require("./comment-router");
const userRouter = require("./user-router");

apiRouter.get("/topics", getAllTopics);

apiRouter.get("/articles", getAllArticles);
apiRouter.use("/articles", articleRouter);

apiRouter.get("/users", getAllUsers);
apiRouter.use("/users", userRouter);

apiRouter.use("/comments", commentRouter);

module.exports = apiRouter;
