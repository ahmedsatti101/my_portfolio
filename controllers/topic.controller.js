const {
  retrieveTopics,
  retrieveArticleById,
  retrieveArticles,
  retrieveArticleComments,
  addComment,
  updateArticle,
  deleteComment,
  retrieveUsers
} = require("../models/topic.model");
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
  const {username, body} = req.body;
  const articleId = req.params.article_id;
  
  const newComment = {
      body,
      article_id: articleId,
      author: username,
      votes: 0,
      created_at: new Date()
    };

  addComment(newComment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(err => {
      next(err)
    })
}

exports.patchArticle = (req, res, next) => {
  const updatedVotes = req.body.inc_votes;
  const updatedArticleId = req.params.article_id;

  updateArticle(updatedVotes, updatedArticleId).then((result) => {
    res.status(200).send(result);
  }).catch(err => {
    next(err)
  })
}

exports.deletedComment = (req, res, next) => {
  const commentId = req.params.comment_id;
  deleteComment(commentId).then((result) => {
    res.status(204).send(result)
  }).catch(err => {
    next(err);
  })
}

exports.getAllUsers = (req, res) => {
  retrieveUsers().then((users) => {
    res.status(200).send({users})
  })
}