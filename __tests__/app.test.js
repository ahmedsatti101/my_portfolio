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
          expect(topics.length).toBe(3)
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
          expect(response.body.article.author).toBe('icellusedkars');
          expect(response.body.article.title).toBe("Eight pug gifs that remind me of mitch");
          expect(response.body.article.article_id).toBe(3);
          expect(response.body.article.body).toBe('some gifs');
          expect(response.body.article.topic).toBe('mitch');
          expect(response.body.article.created_at).toBe('2020-11-03T09:12:00.000Z');
          expect(response.body.article.votes).toBe(0);
          expect(response.body.article.article_img_url).toBe('https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700');
        });
    });

    test('GET 404: sends an appropriate status and error message when given a valid id but does not exist', () => {
        return request(app)
        .get('/api/articles/100')
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe('Article not found')
        })
    })

    test('GET 400: sends an appropriate status and error message when given an invalid id', () => {
        return request(app)
        .get('/api/articles/banana')
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe('Bad request')
        })
    })
  });
});
