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

exports.retrieveArticles = (
  topic,
  sortBy = "created_at",
  order = "desc",
  limit = 10,
  page = 1
) => {
  const parsedLimit = parseInt(limit);
  const pageNumber = parseInt(page);

  if (parsedLimit === 0 || isNaN(parsedLimit)) {
    return Promise.reject({
      status: 400,
      msg: "Limit query must be a number",
    });
  }

  if (pageNumber === 0 || isNaN(pageNumber)) {
    return Promise.reject({
      status: 400,
      msg: "Page query must be a number",
    });
  }

  const queryValues = [];
  let queryStr = `
  SELECT articles.*, COUNT(comment_id) AS comment_count
  FROM articles 
  LEFT JOIN comments 
  ON articles.article_id = comments.article_id`;

  if (topic !== undefined) {
    queryValues.push(topic);
    queryStr += ` WHERE topic = $1`;
  }

  queryStr += ` GROUP BY articles.article_id ORDER BY articles.${sortBy} ${order}`;

  if (limit === 10) {
    queryStr += ` LIMIT 10`;
  } else {
    queryStr += ` LIMIT ${limit}`;
  }

  const validSortQueries = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
    "article_img_url",
  ];

  if (!validSortQueries.includes(sortBy)) {
    return Promise.reject({
      status: 404,
      msg: "Not found",
    });
  }

  const validOrderQueries = ["asc", "desc"];

  if (!validOrderQueries.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request",
    });
  }

  if (pageNumber === undefined) {
    return db.query(queryStr, queryValues).then((result) => {
      return { articles: result.rows, total_count: result.rows.length };
    });
  } else {
    queryStr += ` OFFSET (${pageNumber}-1) * ${limit}`;
    return db.query(queryStr, queryValues).then((result) => {
      return { articles: result.rows, total_count: result.rows.length };
    });
  }
};

exports.retrieveArticleComments = (article_id, limit = 10, page = 1) => {
  const parsedLimit = parseInt(limit);
  const pageNumber = parseInt(page);

  if (parsedLimit === 0 || isNaN(parsedLimit)) {
    return Promise.reject({
      status: 400,
      msg: "Limit query must be a number",
    });
  }

  if (pageNumber === 0 || isNaN(pageNumber)) {
    return Promise.reject({
      status: 400,
      msg: "Page query must be a number",
    });
  }

  let queryStr = `SELECT
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
    comments.created_at DESC 
  LIMIT $2`;

  if (pageNumber === undefined) {
    return db.query(queryStr, [article_id, parsedLimit]).then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article not found",
        });
      }
      return result.rows;
    });
  } else {
    queryStr += ` OFFSET (${pageNumber}-1) * ${limit}`;
    return db.query(queryStr, [article_id, parsedLimit]).then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article not found",
        });
      }
      return result.rows;
    });
  }

  // return db.query(queryStr, [article_id, parsedLimit]).then((result) => {
  //   if (result.rows.length === 0) {
  //     return Promise.reject({
  //       status: 404,
  //       msg: "Article not found",
  //     });
  //   }
  //   return result.rows;
  // });
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

exports.retrieveUserByUsername = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1;`, [username])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "User not found",
        });
      }
      return result.rows;
    });
};

exports.updateComment = (voteNum, comment_id) => {
  return db
    .query(
      `
  UPDATE comments
  SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *;`,
      [voteNum, comment_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment not found",
        });
      }
      return result.rows;
    });
};

exports.addArticle = (newArticle) => {
  return db
    .query(
      `
  INSERT INTO articles
    (author, title, body, topic)
  VALUES
    ($1, $2, $3, $4)
  RETURNING *;`,
      [newArticle.author, newArticle.title, newArticle.body, newArticle.topic]
    )
    .then((result) => {
      result.rows[0].comment_count = 0;
      return result.rows[0];
    });
};

exports.addTopic = (newTopic) => {
  return db
    .query(
      `
  INSERT INTO topics
    (slug, description)
  VALUES
    ($1, $2)
  RETURNING *;`,
      [newTopic.slug, newTopic.description]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.deletedArticle = (article_id) => {
  return db
    .query(
      `WITH deleted_comments AS (
        DELETE FROM comments
        WHERE article_id = $1
        RETURNING article_id
      )
      DELETE FROM articles
      WHERE article_id IN (SELECT article_id FROM deleted_comments);
      `,
      [article_id]
    )
    .then((result) => {
      return result.rows;
    });
};
