const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const app = require("../app");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("/api", () => {
  describe("GET /topics", () => {
    test("GET 200: endpoint responds with an array of topics", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(Array.isArray(topics)).toBe(true);
          topics.forEach((topic) => {
            expect(typeof topic.slug).toBe("string");
            expect(typeof topic.description).toBe("string");
          });
        });
    });
  });

  describe("POST /topics", () => {
    test("POST 201: post request to /api/topics will add a new topic", () => {
      return request(app)
        .post("/api/topics")
        .send({
          description: "what makes good code",
          slug: "testing",
        })
        .expect(201)
        .then(({ body }) => {
          const topic = body.topic;
          expect(topic).toEqual({
            description: "what makes good code",
            slug: "testing",
          });
        });
    });

    test("POST 400: will respond with an error message if request body is missing required keys", () => {
      return request(app)
        .post("/api/topics")
        .send({
          description: "something that hops",
        })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });

    test("POST 400: will respond with an error message if no request body is given", () => {
      return request(app)
        .post("/api/topics")
        .send()
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });
});
