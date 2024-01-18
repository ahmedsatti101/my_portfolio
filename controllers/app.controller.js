const {
  retrieveTopics,
  retrieveArticleById,
  retrieveArticles,
  retrieveArticleComments,
  addComment,
  updateArticle,
  deletedComment,
  retrieveUsers,
  retrieveUserByUsername,
} = require("../models/app.model");
const endpointsFile = require("../endpoints.json");

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
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
  const topic = req.query.topic;
  const sortBy = req.query.sort_by;
  const order = req.query.order;

  retrieveArticles(topic, sortBy, order)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
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

exports.postComment = (req, res, next) => {
  const { username, body } = req.body;
  const articleId = req.params.article_id;

  const newComment = {
    body,
    article_id: articleId,
    author: username,
  };

  addComment(newComment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticle = (req, res, next) => {
  const updatedVotes = req.body.inc_votes;
  const updatedArticleId = req.params.article_id;

  updateArticle(updatedVotes, updatedArticleId)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteCommentById = (req, res, next) => {
  const commentId = req.params.comment_id;

  deletedComment(commentId)
    .then((result) => {
      res.status(204).send(result);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllUsers = (req, res) => {
  retrieveUsers().then((users) => {
    res.status(200).send({ users });
  });
};

exports.getUserByUsername = (req, res, next) => {
  const username = req.params.username;

  retrieveUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};
