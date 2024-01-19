const express = require("express");
const app = express();
const { getAllEndpoints } = require("./controllers/app.controller");
const apiRouter = require("./routers/api-router");

app.use(express.json());

app.get("/api", getAllEndpoints);
app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  if (err.msg && err.status) {
    res.status(404).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  const sqlErrors = ["23502", "22P02"];
  if (sqlErrors.includes(err.code)) {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "23503") {
    res.status(404).send({ msg: "Article not found" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Server error" });
});

module.exports = app;
