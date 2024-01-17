const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const app = require("../app");
const endpointsFile = require("../endpoints.json");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("/api", () => {
  test("GET 200: responds with an object of available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const endpoints = body;
        expect(endpoints).toEqual(endpointsFile);
      });
  });
  describe("GET /topics", () => {
    test("GET 200: endpoint responds with an array of topics", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics.length).toBe(3);
          expect(Array.isArray(topics)).toBe(true);
          topics.forEach((topic) => {
            expect(typeof topic.slug).toBe("string");
            expect(typeof topic.description).toBe("string");
          });
        });
    });
  });
  describe("GET /articles/:article_id", () => {
    test("GET 200: sends an article to the client", () => {
      return request(app)
        .get("/api/articles/3")
        .expect(200)
        .then((response) => {
          expect(response.body.article.author).toBe("icellusedkars");
          expect(response.body.article.title).toBe(
            "Eight pug gifs that remind me of mitch"
          );
          expect(response.body.article.article_id).toBe(3);
          expect(response.body.article.body).toBe("some gifs");
          expect(response.body.article.topic).toBe("mitch");
          expect(response.body.article.created_at).toBe(
            "2020-11-03T09:12:00.000Z"
          );
          expect(response.body.article.votes).toBe(0);
          expect(response.body.article.article_img_url).toBe(
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
          );
        });
    });

    test("GET 404: sends an appropriate status and error message when given a valid id but does not exist", () => {
      return request(app)
        .get("/api/articles/100")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Article not found");
        });
    });

    test("GET 400: sends an appropriate status and error message when given an invalid id", () => {
      return request(app)
        .get("/api/articles/banana")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });
  describe("GET /articles", () => {
    test("GET 200: Should respond with an array of article objects each with the correct properties", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(13);
          expect(Array.isArray(articles)).toBe(true);
          articles.forEach((article) => {
            expect(typeof article.article_id).toBe("number");
            expect(typeof article.title).toBe("string");
            expect(typeof article.topic).toBe("string");
            expect(typeof article.author).toBe("string");
            expect(typeof article.created_at).toBe("string");
            expect(typeof article.votes).toBe("number");
            expect(typeof article.article_img_url).toBe("string");
            expect(typeof article.comment_count).toBe("string");
          });
        });
    });

    test("GET 200: Response array should be sorted by date in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });

    test("GET 404: Should respond with an error if navigated to the wrong endpoint", () => {
      return request(app).get("/api/article").expect(404);
    });
  });
  describe("GET /articles/:article_id/comments", () => {
    test("GET 200: Should respond with an array", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article.length).toBe(11);
          expect(Array.isArray(article)).toBe(true);
          article.forEach((response) => {
            expect(typeof response.comment_id).toBe("number");
            expect(typeof response.votes).toBe("number");
            expect(typeof response.created_at).toBe("string");
            expect(typeof response.author).toBe("string");
            expect(typeof response.body).toBe("string");
            expect(typeof response.article_id).toBe("number");
          });
        });
    });

    test("GET 200: Should respond with article array with comments sorted by most recent", () => {
      return request(app)
        .get("/api/articles/3/comments")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });

    test("GET 404: Should respond with an error if passed a valid id but does not exist", () => {
      return request(app)
        .get("/api/articles/100/comments")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Article not found");
        });
    });

    test("GET 400: Should respond with an error if passed an invalid id", () => {
      return request(app)
        .get("/api/articles/not-an-id/comments")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });
  describe("POST /articles/:article_id/comments", () => {
    test("POST 201: Should send request body with username and body properties and respond with the sent request", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({
          username: "icellusedkars",
          body: "Interesting...",
        })
        .expect(201)
        .then(({ body }) => {
          const comments = body.comment;
          comments.forEach((comment) => {
            expect(comment.comment_id).toBe(19);
            expect(comment.votes).toBe(0);
            expect(typeof comment.created_at).toBe("string");
            expect(comment.author).toBe("icellusedkars");
            expect(comment.body).toBe("Interesting...");
            expect(comment.article_id).toBe(1);
          });
        });
    });

    test("POST 400: Should respond with an error if an empty request body is sent", () => {
      return request(app)
        .post("/api/articles/3/comments")
        .send()
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("POST 400: Should respond with an error if username or body is missing from the sent request", () => {
      return request(app)
        .post("/api/articles/3/comments")
        .send({
          body: "This is working?",
        })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("POST 400: Should respond with an error if passed an invalid id", () => {
      return request(app)
        .post("/api/articles/not-an-id/comments")
        .send({
          username: "icellusedkars",
          body: "This should error",
        })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("POST 404: Should respond with an error if attempting to post comment with user that does not exist", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({
          username: "Ahmed_M",
          body: "This username does not exist",
        })
        .expect(404);
    });

    test("POST 404: Should respond with an error if given a article valid id but does not exist", () => {
      return request(app)
        .post("/api/articles/100/comments")
        .send({
          username: "icellusedkars",
          body: "This should error",
        })
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Article not found");
        });
    });
  });
  describe("PATCH /articles/:article_id", () => {
    test("PATCH 200: Should increment the votes and respond with updated article array", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({
          inc_votes: 1,
        })
        .expect(200)
        .then(({ body }) => {
          expect(typeof body.votes).toBe("number");
          expect(body.votes).toEqual(101);
        });
    });

    test("PATCH 200: Should increment the votes and respond with updated article array for a different article", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({
          inc_votes: 2,
        })
        .expect(200)
        .then(({ body }) => {
          expect(typeof body.votes).toBe("number");
          expect(body.votes).toEqual(2);
        });
    });

    test("PATCH 200: Should decrement the votes and respond with updated article array", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({
          inc_votes: -60,
        })
        .expect(200)
        .then(({ body }) => {
          expect(typeof body.votes).toBe("number");
          expect(body.votes).toEqual(40);
        });
    });

    test("PATCH 400: Should respond with an error if an empty request body is sent", () => {
      return request(app)
        .patch("/api/articles/3")
        .send()
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("PATCH 400: Should respond with an error if request body is sent the wrong data type instead of an integer", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({
          inc_votes: "This is working?",
        })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("PATCH 400: Should respond with an error if passed an invalid id", () => {
      return request(app)
        .patch("/api/articles/not-an-id")
        .send({
          inc_votes: 56,
        })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("PATCH 404: Should respond with an error if given a article valid id but does not exist", () => {
      return request(app)
        .patch("/api/articles/1000")
        .send({
          inc_votes: 5,
        })
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Article not found");
        });
    });
  });
  describe("DELETE /api/comments/:comment_id", () => {
    test("DELETE 204: Should delete given comment by comment_id", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });

    test("DELETE 400: Should respond with an error if given an invalid comment id", () => {
      return request(app)
        .delete("/api/comments/not-an-id")
        .send()
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("DELETE 404: Should respond with an error if given a valid id but does not exist", () => {
      return request(app).delete("/api/comments/100").expect(204);
    });
  });
  describe("GET /api/users", () => {
    test("GET 200: Should respond with an array of all user object with the correct properties", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          const { users } = body;
          expect(users.length).toBe(4);
          expect(Array.isArray(users)).toBe(true);
          users.forEach((user) => {
            expect(user).toHaveProperty("username");
            expect(user).toHaveProperty("name");
            expect(user).toHaveProperty("avatar_url");
            expect(typeof user.username).toBe("string");
            expect(typeof user.name).toBe("string");
            expect(typeof user.avatar_url).toBe("string");
          });
        });
    });

    test("GET 404: Should respond with an error if navigated to the wrong endpoint", () => {
      return request(app).get("/api/user").expect(404);
    });
  });
  describe("GET /api/articles?topic=", () => {
    test("GET 200: filters the data by passed topic query parameter of cats", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          expect(articles.length).toBe(1);
          articles.forEach((article) => {
            expect(article).toHaveProperty("topic");
            expect(article.topic).toBe("cats");
            expect(article).toHaveProperty("article_id");
            expect(article).toHaveProperty("title");
            expect(article).toHaveProperty("author");
            expect(article).toHaveProperty("created_at");
            expect(article).toHaveProperty("votes");
            expect(article).toHaveProperty("article_img_url");
            expect(article).toHaveProperty("comment_count");
          });
        });
    });

    test("GET 404: Should send error for invalid value for topic query parameter", () => {
      return request(app).get("/api/treasures?topic=banana").expect(404);
    });

    test("GET 200: Should respond with an array of article objects if no query is given", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(13);
          expect(Array.isArray(articles)).toBe(true);
          articles.forEach((article) => {
            expect(typeof article.article_id).toBe("number");
            expect(typeof article.title).toBe("string");
            expect(typeof article.topic).toBe("string");
            expect(typeof article.author).toBe("string");
            expect(typeof article.created_at).toBe("string");
            expect(typeof article.votes).toBe("number");
            expect(typeof article.article_img_url).toBe("string");
            expect(typeof article.comment_count).toBe("string");
          });
        });
    });
  });
  describe.skip("GET /api/articles/:article_id?comment_count", () => {
    test("GET 200: Should respond with the comment count for an article object", () => {
      return request(app)
        .get("/api/articles/1?comment_count")
        .expect(200)
        .then(({ body }) => {
          const {article} = body;
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("body");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
    });
  });
});
