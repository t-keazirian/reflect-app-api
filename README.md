# Reflect API

## This is the back-end server API for my second Full-Stack Capstone project for Thinkful's software engineering bootcamp.

### This project was created with:
* Node
* Express
* PostgreSQL

---

# API Documentation:

All responses come in standard JSON.  All requests must include a content-type of application/json and the body must be valid JSON.

##### This REST API allows you to:
* GET:
  * Endpoint: /api/reflections

* POST:
  * Endpoint: /api/reflections

* DELETE
  * Endpoint: /api/reflections/:id

* PATCH
  * Endpoint: /api/reflections/:id

### Links:
* Live App: https://reflect-app-rouge.vercel.app/
* Live App GitHub Repo: https://github.com/t-keazirian/reflect-app

#### This app is deployed through Heroku

To seed the meditations table:

psql -U dunder_mifflin -d reflections -f ./seeds/seed.meditations.sql 

To seed the users table:

psql -U dunder_mifflin -d reflections -f ./seeds/seed.users.sql

