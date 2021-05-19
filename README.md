# Reflect API

## This is the back-end server API for my second Full-Stack Capstone project for Thinkful's software engineering bootcamp.

### This project was created with:
* Node
* Express
* PostgreSQL

---

# API Documentation:

All responses come in standard JSON.  All requests must include a content-type of application/json and the body must be valid JSON.

##### REST APIs:

** This app requires authorization/authentication. The front end provides a Demo account from the database, or the user can create their own.

### Reflections endpoint: /api/reflections/:user_id
- Must be a valid user in the database
* GET
* POST

### Reflections endpoint: /api/reflections/meditations/:user_id
- Must be a valid user in the database
* DELETE
* PATCH

### Auth endpoint: /api/auth/login
- Authorization Login for user in the database
* POST

### Auth endpoint: /api/auth/refresh
- refresh authToken
* POST

### Users endpoint: /api/users 
- create a new user in the database
- create JWT for user

* POST

### 

### Links:
* Live App: https://reflect-app-rouge.vercel.app/
* Live App GitHub Repo: https://github.com/t-keazirian/reflect-app

#### This app is deployed through Heroku

To seed the meditations table:
psql -U dunder_mifflin -d reflections -f ./seeds/seed.meditations.sql 

To seed the users table:
psql -U dunder_mifflin -d reflections -f ./seeds/seed.users.sql

To connect to the database:
pg_ctl -D /usr/local/var/postgres start