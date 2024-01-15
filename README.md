# Running the portfolio locally

You will need to clone the repository to your machine and then you will need to add two files to your locally cloned repo in order to connect to two databases locally using PSQL. Add .env.test and .env.development and insert into each file PGDATABASE= with the correct database name for that specific environment. You can look in /db/setup.sql for the database names.