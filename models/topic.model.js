const db = require("../db/connection");

exports.retrieveTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
};

exports.addTopic = (newTopic) => {
  return db
    .query(
      `
    INSERT INTO topics
        (description, slug)
    VALUES
        ($1, $2)
    RETURNING *`,
      [newTopic.description, newTopic.slug]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
