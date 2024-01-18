# About
This project is an API that was built to go through the process of what is it like building a backend service that later on was to be used by a front end architecture. It was built entirely using JavaScript and PostgreSQL for database creation and data storage. The database is hosted on [ElephantSQL](https://www.elephantsql.com/) and the project is hosted on [Render](https://render.com/).

# How do I run this on my machine?
You will need to clone the repository to your machine and add two `.env` files to your locally cloned repo in order to connect to a test and development database using PSQL. Add `.env.test` and `.env.development` to the top level of your folder and insert into each file `PGDATABASE=DATABASE_NAME_HERE` with the correct database name for that specific environment. You can look in `/db/setup.sql` for the database names for each environment. You will then need to run `npm install` to install the `node_modules` necessary for the project to run properly. After completing everything, you can have a look at `package.json` for the available scripts. To set up the local database `npm run setup-dbs` and seed them `npm run seed`, and for running the tests you run `npm run test` or `npm test`.

# Where can I see the project?
[Here](https://portfolio-web-service-n7kk.onrender.com/api).

# How do I use i?
You can navigate to several endpoints including:
- `/api`
- `/api/topics`
- `/api/articles` => You can make a topic query to this endpoint with `/api/articles?topic=<topic here>`, not providing a topic will display all articles
- `/api/articles/:article_id`
- `/api/articles/:article_id/comments` => View the number of comments for an article

Info on each endpoint can be found in the `endpoints.json` file.
