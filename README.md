# Node.js Socket Chat

A simple Express + MongoDB + Socket.io backend where **players** and **fans** can register, log in, and chat in real time.

## Features

- Register as **player** or **fan** (bcrypt‑hashed password)
- Login with JWT authentication
- Real‑time private messaging (fan ↔ player only) via Socket.io
- Message persistence in MongoDB
- Conversation retrieval API
- Online/offline presence broadcast
- Pending messages sent as soon as user gets online

## Tech stack

- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT (jsonwebtoken)
- bcrypt

## Setup

1. Clone & install
   ```bash
   git clone <repo>
   cd node-socket-chat
   npm install
   ```
