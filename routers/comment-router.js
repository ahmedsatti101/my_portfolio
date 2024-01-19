const commentRouter = require("express").Router();
const { deleteCommentById, patchComment } = require("../controllers/app.controller");

commentRouter.delete("/:comment_id", deleteCommentById);
commentRouter.patch("/:comment_id", patchComment);

module.exports = commentRouter;
