# tic-tac-toe

Tic-Tac-Toe Online Game

> On halt

## What is this project

As we all probably know, tic-tac-toe is a game where people places their moves in a 3x3 board. This project is my side project (focusing on the backend actually) to practice websocket communication between two online players doing realtime gaming activity. As mentioned, this project is supposed to be for me practicing websocket only focusing on the backend side. It is also a practice for using MongoDB as the NoSQL database of choice to store the game state and activity logs (like moves done) of the game. I believe NoSQL database have a really strong usecase in most application such as this tic-tac-toe game. The frontend side, is really for me practicing how to setup a monorepo. Aside from that, I am not focusing on the frontend side.

## Prequisites

> Sorry have not provide the docker.

1. Have MongoDB and PostgreSQL installed.
2. Have `concurrently` npm packacge installed (globally prefered).
3. Check the `.env.template` for Postgres environment, and look into `backend/src/repository/mongo.ts` for the MongoDB. Sorry have not provide env for Mongo.

## How to Clone

1. Clone this repository. This repository is a monorepo containing the backend and frontend application.
2. Next, on the root directory, run `yarn workspace backend prisma:migrate` to set up database by prisma.
3. Next, just run `yarn dev`. Both the frontend and backend app, will automatically run for you.
