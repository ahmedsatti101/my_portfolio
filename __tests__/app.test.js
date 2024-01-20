const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const app = require("../app");
const endpointsFile = require("../endpoints.json");
const { expect, test, describe } = require("@jest/globals");

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
          const article = response.body.article;
          expect(Array.isArray(article)).toBe(true);
          expect(article.length).toBe(1);
          article.forEach((object) => {
            expect(object.author).toBe("icellusedkars");
            expect(object.title).toBe("Eight pug gifs that remind me of mitch");
            expect(object.article_id).toBe(3);
            expect(object.body).toBe("some gifs");
            expect(object.topic).toBe("mitch");
            expect(object.created_at).toBe("2020-11-03T09:12:00.000Z");
            expect(object.votes).toBe(0);
            expect(object.article_img_url).toEqual(
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
            );
          });
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
          expect(articles.length).toBe(10);
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
          const { comments } = body;
          expect(comments.length).toBe(10);
          expect(Array.isArray(comments)).toBe(true);
          comments.forEach((response) => {
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
          const { comments } = body;
          expect(comments).toBeSortedBy("created_at", {
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

    test("POST 404: Should respond with an error if attempting to post comment with article that does not exist", () => {
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
  describe("DELETE /comments/:comment_id", () => {
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

    test("DELETE 204: Should respond with an error if given a valid id but does not exist", () => {
      return request(app).delete("/api/comments/100").expect(204);
    });
  });
  describe("GET /users", () => {
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
  describe("GET /articles?topic=", () => {
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
          expect(articles.length).toBe(10);
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

    test("GET 200: Should respond with an empty array if given a valid topic query but no articles available", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(0);
          expect(Array.isArray(articles)).toBe(true);
        });
    });
  });
  describe("GET /articles/:article_id (comment_count)", () => {
    test("GET 200: Should respond with the comment count property for an article array", () => {
      return request(app)
        .get("/api/articles/5")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(Array.isArray(article)).toBe(true);
          expect(article.length).toBe(1);
          article.forEach((object) => {
            expect(object).toHaveProperty("comment_count");
          });
        });
    });

    test("GET 404: Should respond with an error if given a valid id but does not exist", () => {
      return request(app)
        .get("/api/articles/100?comment_count")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Article not found");
        });
    });

    test("GET 400: Should respond with an error if given a invalid id", () => {
      return request(app)
        .get("/api/articles/not-an-id?comment_count")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });
  describe("GET /articles (sorting queries)", () => {
    test("GET 200: Will accept a sort_by query parameter that sorts to created_at by default in a descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });

    test("GET 200: Will accept a query parameter of order that orders in ascending order (defaults to descending)", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at&order=asc")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy("created_at", {
            descending: false,
            coerce: true,
          });
        });
    });

    test("GET 404: sends an appropriate status and error message when given an invalid value for sort_by query parameter", () => {
      return request(app).get("/api/articles?sort_by=banana").expect(404);
    });

    test("GET 400: sends an appropriate status and error message when given an invalid value for order query parameter", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at&order=colour")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });
  describe("GET /users/:username", () => {
    test("GET 200: Should get user by username", () => {
      return request(app)
        .get("/api/users/butter_bridge")
        .expect(200)
        .then(({ body }) => {
          const { user } = body;
          expect(user.length).toBe(1);
          expect(Array.isArray(user)).toBe(true);
          user.forEach((property) => {
            expect(property).toHaveProperty("username");
            expect(typeof property.username).toBe("string");
            expect(property).toHaveProperty("avatar_url");
            expect(typeof property.avatar_url).toBe("string");
            expect(property).toHaveProperty("name");
            expect(typeof property.name).toBe("string");
          });
        });
    });

    test("GET 404: Should respond with an error if given a user that does not exist", () => {
      return request(app)
        .get("/api/users/Karl")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("User not found");
        });
    });

    test("GET 404: Should respond with an error if given a invalid user", () => {
      return request(app)
        .get("/api/users/23")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("User not found");
        });
    });
  });
  describe("PATCH /comments/:comment_id", () => {
    test("PATCH 200: Should increment the votes and respond with updated comment array", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({
          inc_votes: 2,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.length).toBe(1);
          expect(Array.isArray(body)).toBe(true);
          body.forEach((comment) => {
            expect(typeof comment.comment_id).toBe("number");
            expect(comment.comment_id).toBe(1);
            expect(typeof comment.body).toBe("string");
            expect(typeof comment.article_id).toBe("number");
            expect(typeof comment.author).toBe("string");
            expect(comment.votes).toBe(18);
            expect(typeof comment.votes).toBe("number");
            expect(typeof comment.created_at).toBe("string");
          });
        });
    });

    test("PATCH 200: Should decrement the votes and respond with updated comment array", () => {
      return request(app)
        .patch("/api/comments/3")
        .send({
          inc_votes: -60,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.length).toBe(1);
          expect(Array.isArray(body)).toBe(true);
          body.forEach((comment) => {
            expect(typeof comment.comment_id).toBe("number");
            expect(comment.comment_id).toBe(3);
            expect(typeof comment.body).toBe("string");
            expect(typeof comment.article_id).toBe("number");
            expect(typeof comment.author).toBe("string");
            expect(comment.votes).toBe(40);
            expect(typeof comment.votes).toBe("number");
            expect(typeof comment.created_at).toBe("string");
          });
        });
    });

    test("PATCH 400: Should respond with an error if an empty request body is sent", () => {
      return request(app)
        .patch("/api/comments/3")
        .send()
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("PATCH 400: Should respond with an error if request body is sent the wrong data type instead of an integer", () => {
      return request(app)
        .patch("/api/comments/16")
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
        .patch("/api/comments/not-an-id")
        .send({
          inc_votes: 56,
        })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("PATCH 404: Should respond with an error if given a comment valid id but does not exist", () => {
      return request(app)
        .patch("/api/comments/1000")
        .send({
          inc_votes: 5,
        })
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Comment not found");
        });
    });
  });
  describe("POST /articles", () => {
    test("POST 201: Should add a new article and respond with the article", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "rogersop",
          title: "Why tested code is good code",
          body: "Because that's what makes a good software developer good!",
          topic: "paper",
        })
        .expect(201)
        .then(({ body }) => {
          expect(body.article_id).toBe(14);
          expect(body.body).toBe(
            "Because that's what makes a good software developer good!"
          );
          expect(body.title).toBe("Why tested code is good code");
          expect(body.article_img_url).toBe(
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
          );
          expect(body.topic).toBe("paper");
          expect(body.votes).toBe(0);
          expect(typeof body.created_at).toBe("string");
          expect(body.comment_count).toBe(0);
        });
    });

    test("POST 400: Should respond with an error if an empty request body is sent", () => {
      return request(app)
        .post("/api/articles")
        .send()
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("POST 400: Should respond with an error if one or more properties are missing from the request", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "rogersop",
          body: "This is working?",
        })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("GET 404: Should respond with an error if navigated to the wrong endpoint", () => {
      return request(app).post("/api/article").expect(404);
    });
  });
  describe("GET /articles (pagination)", () => {
    test("GET 200: Should respond with a certain number of article objects depending on 'limit' query (limited to '10' by default)", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          expect(articles.length).toBe(10);
        });
    });

    test("GET 200: Should respond with a certain number of article objects depending on 'limit' query", () => {
      return request(app)
        .get("/api/articles?limit=2")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          expect(articles.length).toBe(2);
        });
    });

    test("GET 400: Should respond with an error if given a limit value that is not a number", () => {
      return request(app)
        .get("/api/articles?limit=not-a-number")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Limit query must be a number");
        });
    });

    test("GET 200: Should respond with the correct articles when specifying a page number (p)", () => {
      return request(app)
        .get("/api/articles?p=2")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          expect(articles.length).toBe(3);
        });
    });

    test("GET 200: Should respond with the correct articles when specifying a page number and a limit", () => {
      return request(app)
        .get("/api/articles?p=2&limit=5")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          expect(articles.length).toBe(5);
        });
    });

    test("GET 400: Should respond with an error if given a page value that is not a number", () => {
      return request(app)
        .get("/api/articles?p=not-a-number&limit=5")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Page query must be a number");
        });
    });

    test("GET 200: Should respond with a total_count property displaying number of articles in a page", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toEqual(body.articles.length);
        });
    });
  });
  describe("GET /articles/:article_id/comments (pagination)", () => {
    test("GET 200: Should respond with a certain number of comment objects for an article depending on 'limit' query (limited to '10' by default)", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const comments = body.comments;
          expect(comments.length).toBe(10);
        });
    });

    test("GET 200: Should respond with a certain number of comment objects for an article depending on 'limit' query", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=3")
        .expect(200)
        .then(({ body }) => {
          const comments = body.comments;
          expect(comments.length).toBe(3);
        });
    });

    test("GET 400: Should respond with an error if given a limit value that is not a number", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=not-a-number")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Limit query must be a number");
        });
    });

    test("GET 200: Should respond with the correct comments for an article when specifying a page number (p)", () => {
      return request(app)
        .get("/api/articles/1/comments?p=2")
        .expect(200)
        .then(({ body }) => {
          const comments = body.comments;
          expect(comments.length).toBe(1);
        });
    });

    test("GET 200: Should respond with the correct comments when specifying a page number and a limit", () => {
      return request(app)
        .get("/api/articles/1/comments?p=2&limit=5")
        .expect(200)
        .then(({ body }) => {
          const comments = body.comments;
          expect(comments.length).toBe(5);
        });
    });

    test("GET 400: Should respond with an error if given a page value that is not a number", () => {
      return request(app)
        .get("/api/articles/1/comments?p=not-a-number&limit=5")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Page query must be a number");
        });
    });
  });
});
