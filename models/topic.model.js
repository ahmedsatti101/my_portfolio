const db = require("../db/connection");

exports.retrieveTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
};

exports.retrieveArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
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

exports.retrieveArticles = () => {
  return db
    .query(
      `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url FROM articles JOIN comments ON articles.article_id = comments.article_id ORDER BY articles.created_at DESC;`
    )
    .then((result) => {
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

exports.addComment = ({ body, article_id, author, votes, created_at }) => {
  return db.query(`
  INSERT INTO comments
    (body, article_id, author, votes, created_at)
  VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *`, [body, article_id, author, votes, created_at])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article not found",
        });
      }
      return result.rows;
    })
}

exports.updateArticle = (voteNum, article_id) => {
  return db.query(`
  UPDATE articles
  SET votes = votes + $1
  WHERE article_id = $2
  RETURNING *;`, [voteNum, article_id])
  .then((result) => {
    return result.rows[0]
  })
}