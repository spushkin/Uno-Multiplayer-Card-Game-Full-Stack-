# UNO Game [Team K, Spring 2024]

# Сontents

- [Screenshots](#screenshots)
- [About the game](#about-the-game)
- [Tech Stack](#tech-stack)
- [Stack diagram](#stack-diagram)
- [Available scripts](#available-scripts)
- [Build and Run Instructions](#build-and-run-instructions)
- [Database setup](#database-setup)
- [Run Database](#run-database)
  
# Screenshots
![image](https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-k/assets/42389366/cf6b3425-0a55-4d18-af7a-e8ed7e44ff40)
<img width="1117" alt="Screenshot 2024-05-23 at 10 14 43 PM" src="https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-k/assets/42389366/f3e562eb-5e0a-4d92-b756-4b08a1913a5a">
<img width="1252" alt="Screenshot 2024-05-23 at 10 15 23 PM" src="https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-k/assets/42389366/27726425-bf9e-4771-9331-5656e35e0eee">

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

# Tech Stack

- Pug
- Node.js
- Express.js
- PostgreSQL
- CSS
- HTML
- JavaScript

# Stack diagram

![Screenshot 2024-05-23 222517](https://github.com/sfsu-csc-667-spring-2024-roberts/term-project-team-k/assets/42389366/44390990-3fdb-49a9-b4f2-ccd23902a58b)

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

# Run Database

```
 psql -d DATABASE_NAME
```
