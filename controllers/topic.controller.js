const { retrieveTopics, addTopic } = require("../models/topic.model");

exports.getAllTopics = (req, res) => {
  retrieveTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.postTopic = (req, res, next) => {
    const newTopic = req.body;

    addTopic(newTopic).then((topic) => {
        res.status(201).send({topic});
    }).catch((err) => {
        next(err);
    })
}
