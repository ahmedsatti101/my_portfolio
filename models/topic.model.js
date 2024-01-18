const db = require("../db/connection");

exports.retrieveTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
};

exports.retrieveArticleById = (article_id) => {
  const requestedArticleId = [];
  let queryStr = `SELECT articles.*, COUNT(comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments
  ON comments.article_id = articles.article_id`;

  if (article_id) {
    requestedArticleId.push(article_id);
    queryStr += ` WHERE articles.article_id = $1`;
  }

  queryStr += ` GROUP BY articles.article_id`;

  return db.query(queryStr, requestedArticleId).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "Article not found",
      });
    }
    return result.rows;
  });
};

exports.retrieveArticles = (topic) => {
  const queryValues = [];
  let queryStr = `
  SELECT articles.*, COUNT(comment_id) AS comment_count
  FROM articles 
  LEFT JOIN comments 
  ON articles.article_id = comments.article_id`;

  if (topic) {
    queryValues.push(topic);
    queryStr += ` WHERE topic = $1`;
  }

  queryStr += ` GROUP BY articles.article_id ORDER BY articles.created_at DESC`;

  return db.query(queryStr, queryValues).then((result) => {
    return result.rows;
  });
};

exports.retrieveArticleComments = (article_id) => {
  return db
    .query(
      `SELECT
          comments.comment_id,
          comments.votes,
          comments.created_at,
          comments.author,
          comments.body,
          comments.article_id
        FROM
          comments
        JOIN
          users ON comments.author = users.username
        JOIN
          articles ON comments.article_id = articles.article_id
        WHERE
          comments.article_id = $1
        ORDER BY
          comments.created_at DESC;
      `,
      [article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article not found",
        });
      }
      return result.rows;
    });
};

exports.addComment = ({ body, article_id, author }) => {
  return db
    .query(
      `
  INSERT INTO comments
    (body, article_id, author)
  VALUES
    ($1, $2, $3)
    RETURNING *`,
      [body, article_id, author]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article not found",
        });
      }
      return result.rows;
    });
};

exports.updateArticle = (voteNum, article_id) => {
  return db
    .query(
      `
  UPDATE articles
  SET votes = votes + $1
  WHERE article_id = $2
  RETURNING *;`,
      [voteNum, article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article not found",
        });
      }
      return result.rows[0];
    });
};

exports.deletedComment = (comment_id) => {
  return db
    .query(
      `DELETE FROM comments
  WHERE comment_id = $1`,
      [comment_id]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.retrieveUsers = () => {
  return db.query(`SELECT * FROM users;`).then((result) => {
    return result.rows;
  });
};
