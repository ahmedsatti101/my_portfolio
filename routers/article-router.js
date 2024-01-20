const articleRouter = require("express").Router();
const {
  getArticleById,
  getArticleComments,
  postComment,
  patchArticle,
  deleteArticleById
} = require("../controllers/app.controller");

articleRouter.get("/:article_id", getArticleById);

articleRouter.get("/:article_id/comments", getArticleComments);

articleRouter.post("/:article_id/comments", postComment);

articleRouter.patch("/:article_id", patchArticle);

articleRouter.delete("/:article_id", deleteArticleById);

module.exports = articleRouter;
