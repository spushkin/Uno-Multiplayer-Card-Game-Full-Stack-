# UNO Game [Team K, Spring 2024]

# Сontents

- [UNO Game](#uno-game)
- [Сontents](#сontents)
- [About the game](#about-the-game)
- [Available scripts](#available-scripts)

# Screenshots



# About the game

Our UNO game follows the classic rules: each player starts with a hand of cards, and the objective is to be the first to empty your hand by matching cards based on their number, color, or type. We've also included the action cards that can change the course of the game, such as skip, reverse, draw two, and wild cards.

## Key Features:
### User Authentication:
- Create User: New users can create an account with a secure password.
- Login/Logout: Users can log in and log out securely using bcrypt hashing for password storage.
### Game Mechanics:
- Join a Game: Users can join an existing game or create a new one.
- Leave a Game: Players can disconnect from a game at any time without disrupting the flow.
- Play a Card: Players can play a card that matches the top card on the discard pile by number, color, or type.
- Draw a Card: Players can draw from the deck if they cannot play a card.
- Declare UNO: When a player has only one card left, they can declare UNO to notify other players.
### Chat Functionality:
- Global Chat: All players in the lobby can chat with each other.
- Private Chat: Players can send private messages to each other during the game.

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
