const {
  retrieveTopics,
  retrieveArticleById,
  retrieveArticles,
  retrieveArticleComments,
} = require("../models/topic.model");
const endpointsFile = require("../endpoints.json");
const fs = require("fs/promises");

exports.getAllTopics = (req, res) => {
  retrieveTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.getAllEndpoints = (req, res) => {
  res.status(200).send(endpointsFile);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  retrieveArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
      fs.readFile("./endpoints.json", "utf-8").then((endpoint) => {
        const parsedData = JSON.parse(endpoint);
        parsedData["GET /api/articles:article_id"] = {
          description: "get an article by its id",
          queries: [],
          exampleResponse: [{ article }],
        };
        return fs.writeFile(
          "./endpoints.json",
          JSON.stringify(parsedData, null, 2)
        );
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllArticles = (req, res) => {
  const formattedArticleData = [];
  const countArticles = {};
  retrieveArticles().then((articles) => {
    articles.forEach((article) => {
      const articleId = article.article_id;
      countArticles[articleId] = (countArticles[articleId] || 0) + 1;

      formattedArticleData.push({
        ...article,
        comment_count: countArticles[articleId],
      });
    });
    res.status(200).send({ articles: formattedArticleData });
    fs.readFile("./endpoints.json", "utf-8").then((endpoint) => {
      const parsedData = JSON.parse(endpoint);
      parsedData["GET /api/articles"] = {
        description: "get all articles",
        queries: [],
        exampleResponse: [{ articles: formattedArticleData }],
      };
      return fs.writeFile(
        "./endpoints.json",
        JSON.stringify(parsedData, null, 2)
      );
    });
  });
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  retrieveArticleComments(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
