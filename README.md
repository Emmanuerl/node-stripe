# Node Stripe

a sample demonstration of how to accept one time and recurring payments using stripe

### Problem Statement

How can we develop a versatile plugin middleware solution capable of seamlessly initiating and efficiently processing checkouts on the Stripe payment platform to enhance the user experience and streamline the payment process for e-commerce websites and applications?

### Assumptions

Assume all users on your platform have alreaddy been onboarded to your stripe account. see [stripe customers](https://stripe.com/docs/billing/customer)

### Technology Stack

- Javascript (using jsdoc for typehinting)
- MySQL
- Knex.js

### Usage

1. Clone the repository and CD

```sh
$ git clone <repository_url>
$ cd ./<repository>
```

2. Install dependencies using npm

```sh
$ npm install
```

3. Setup your env variables using the .env.example template

```sh
$ cp .env.example .env
```

3. Migrate your database

```sh
$ # ensure you have created your db as specified in your .env
$ npm run knex migrate:up
```

4. Start the application

```sh
# In dev mode
$ npm run dev

# in production
$ npm start
```

### Running Tests

All tests are e2e and are handled using Mocha + Chai .

```sh
# to run all tests
$ npm test
```
