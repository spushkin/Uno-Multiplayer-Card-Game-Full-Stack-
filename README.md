# UNO Game

# Сontents

- [UNO Game](#uno-game)
- [Сontents](#сontents)
- [About the game](#about-the-game)
- [Available scripts](#available-scripts)
- // TODO complete

# About the game

// TODO complete

# Available scripts

For the first run, follow these [instructions](#build-and-run-instructions)

---

Run locally on [localhost:3000](http://localhost:3000)

```
npm run start:dev
```

Run tests locally

```
npm run test
```

# Build and Run Instructions

<ol>
<li>Clone repository from GitHub:

```
git clone https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-k.git
```

</li>
<li>Go to the application folder:

```
cd uno-team-k-spring-2024
```

</li>
<li>

[Setup PostgreSQL database](#build-and-run-instructions)

</li>

</li>
<li>
Install <a href="https://nodejs.org/en/" target="_blank">NodeJs</a>
</li>
<li>Install dependencies:

```
npm install
```

</li>
<li>[Optional] migrate database ( already included in <code>postinstall</code> script )

```
npm run db:migrate
```

</li>
<li>Run locally:

```
npm run start:dev
```

</li>
<li>Open in browser (Google Chrome recommended):

[localhost:3000](http://localhost:3000)

</li>

</ol>

# Database setup

Install [Postgres](https://www.postgresql.org/download/)<br>
Create a new database:

```
createdb DATABASE_NAME
```

Set up dotenv to enable user-specific environment variables:

```
npm i --save dotenv
echo ".env" >> .gitignore
touch .env
echo DATABASE_URL=postgres://`whoami`@localhost:5432/DATABASE_NAME >> .env
```

Example of <code>.env</code>:<br>

```
DATABASE_URL=postgres://usernam@localhost:5432/DATABASE_NAME
```

# Run Datbase

```
 psql -d DATABASE_NAME
```
