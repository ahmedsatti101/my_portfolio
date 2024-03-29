const express = require("express");
const app = express();
const { getAllEndpoints } = require("./controllers/app.controller");
const apiRouter = require("./routers/api-router");
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get("/api", getAllEndpoints);
app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({ msg: err.msg });
  } else if (err.status !== 404) {
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
  if (err.status !== 404) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Server error" });
});

module.exports = app;
