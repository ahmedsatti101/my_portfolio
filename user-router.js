const userRouter = require("express").Router();
const { getUserByUsername } = require("./controllers/app.controller");

userRouter.get("/:username", getUserByUsername);

module.exports = userRouter;
