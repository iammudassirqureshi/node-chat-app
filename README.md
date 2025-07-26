# Chat Application

A real-time chat application built with Node.js, Express, MongoDB, and Socket.IO. This application allows users with different roles ("fan" and "player") to register, log in, and engage in private conversations. The app enforces role-based restrictions, ensuring that fans can only chat with players and vice versa.

## Table of Contents
- [Chat Application](#chat-application)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
  - [API Documentation](#api-documentation)
    - [Base URL](#base-url)
    - [Authentication Endpoints](#authentication-endpoints)
      - [1. Register a User](#1-register-a-user)
      - [2. Login a User](#2-login-a-user)
    - [Chat Endpoints](#chat-endpoints)
      - [1. Get Conversation](#1-get-conversation)
    - [WebSocket Events](#websocket-events)
  - [Socket.IO Testing Guide](#socketio-testing-guide)
    - [Testing Real-Time Messaging in Postman](#testing-real-time-messaging-in-postman)
    - [Testing Other Roles](#testing-other-roles)
  - [Postman Collection](#postman-collection)
  - [Project Structure](#project-structure)

## Features
- User registration and login with JWT-based authentication.
- Role-based access control (fan or player).
- Real-time private messaging using Socket.IO.
- MongoDB for persistent storage of users and messages.
- Secure password hashing with bcrypt.
- API request logging with Morgan.
- Error handling and graceful MongoDB connection management.

## Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**
- A code editor (e.g., VS Code)
- Postman (optional, for testing APIs)

## Installation
1. **Clone the repository**:
   ```bash
   git clone (https://github.com/iammudassirqureshi/node-chat-app.git)
   cd chat-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following variables (see [Environment Variables](#environment-variables) for details):
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/chat-app
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=1d
   ```

## Environment Variables
The application requires the following environment variables in a `.env` file:

| Variable          | Description                                      | Example                              |
|-------------------|--------------------------------------------------|--------------------------------------|
| `PORT`            | Port on which the server runs                    | `5001`                               |
| `MONGO_URI`       | MongoDB connection string                        | `mongodb://localhost:27017/chat-app` |
| `JWT_SECRET`      | Secret key for JWT signing                       | `your_jwt_secret_key`                |
| `JWT_EXPIRES_IN`  | JWT token expiration duration                    | `1d` (1 day)                         |

## Running the Application
1. **Start MongoDB**:
   Ensure your MongoDB instance is running locally or accessible via the provided `MONGO_URI`.

2. **Run the application**:
   ```bash
   npm run dev
   ```

3. The server will start on `http://localhost:5001` (or the port specified in `.env`).

4. **Test the APIs**:
   Use Postman or any API client to test the endpoints (see [API Documentation](#api-documentation)).

## API Documentation
The API provides endpoints for user authentication and chat functionality. All endpoints return JSON responses with a `success` boolean, a `message`, and relevant data or error details.

### Base URL
`http://localhost:5001`

### Authentication Endpoints
#### 1. Register a User
- **Endpoint**: `POST /auth/register`
- **Description**: Registers a new user with a name, email, password, and role.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "fan" // or "player"
  }
  ```
- **Responses**:
  - `201 Created`: User registered successfully, returns JWT token.
  - `400 Bad Request`: Missing or invalid fields, or user already exists.
  - `500 Internal Server Error`: Server error.

#### 2. Login a User
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Responses**:
  - `200 OK`: User logged in successfully, returns JWT token and user data.
  - `400 Bad Request`: Missing or invalid fields.
  - `401 Unauthorized`: Invalid credentials.
  - `500 Internal Server Error`: Server error.

### Chat Endpoints
#### 1. Get Conversation
- **Endpoint**: `GET /chat/:id`
- **Description**: Retrieves the conversation between the authenticated user and another user.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Parameters**:
  - `id`: The ID of the other user in the conversation.
- **Responses**:
  - `200 OK`: Returns the conversation history.
  - `400 Bad Request`: Missing or invalid user ID, or attempting to chat with oneself.
  - `403 Forbidden`: Chat not allowed between users of the same role.
  - `404 Not Found`: Other user not found.
  - `401 Unauthorized`: Invalid or missing token.
  - `500 Internal Server Error`: Server error.

### WebSocket Events
The application uses Socket.IO for real-time messaging. Connect to the server with the JWT token in the `Authorization` header or as a query parameter (`?authorization=<token>`).

| Event             | Description                                      | Payload Example                              |
|-------------------|--------------------------------------------------|----------------------------------------------|
| `connection`      | Triggered when a client connects.                | N/A                                          |
| `userOnline`      | Broadcasts when a user comes online.             | `{ userId, name, role }`                     |
| `userOffline`     | Broadcasts when a user goes offline.             | `{ userId }`                                 |
| `privateMessage`  | Sends a private message to another user.         | `{ to: "userId", message: "Hello!" }`        |
| `message`         | Emits a message to the sender and recipient.     | `{ senderId, receiverId, message, delivered }`|
| `chatError`       | Emits an error message to the client.            | `string` (error message)                     |

## Socket.IO Testing Guide

### Testing Real-Time Messaging in Postman

To test real-time messaging in Postman, create a new Socket.IO request by following these steps:

1. **Create a Socket.IO Request**:
   - Open Postman and click **New** > **Socket.IO** to create a new Socket.IO request.
   - Enter the URL: `http://localhost:5001`.

2. **Configure Events**:
   - Navigate to the **Events** tab.
   - Add the following events to listen for: `userOnline`, `userOffline`, `message`, `error`, and `chatError`.

3. **Set Headers For Authentication**:
   - Under the **Headers** tab, add:
     - **Key**: `Authorization`
     - **Value**: `token`
   - 

4. **Configure Message**:
   - Under the **Message** section, select **JSON** as the format.
   - Add the following JSON object:
     ```json
     {
       "to": "6885385d06aa67eb4894e2ec", // other user id
       "message": "Hello, Fan! 👋" // message you want to send
     }
     ```
   - In the **Event Name** box, enter: `privateMessage`.

5. **Send the Request**:
   - Click **Connect** to establish the connection, then send the message to test the real-time functionality.

### Testing Other Roles

For testing other roles, create additional Socket.IO requests following the same steps outlined above.

## Postman Collection
The Postman collection for testing the API is available at: [Postman Collection URL](https://documenter.getpostman.com/view/33615747/2sB3B7MYab)

To use the collection:
1. Import the collection into Postman.
2. Use the `node_chat_app` environment attached with collecton with the base URL (`http://localhost:5001`) and a `token` variable for authentication.
3. Test the `register`, `login`, and `conversation` endpoints.

## Project Structure
```
chat-app/
├── src/
│   ├── config/
│   │   └── mongoose.mjs         # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.mjs   # Authentication logic
│   │   └── chatController.mjs   # Chat logic
│   ├── middleware/
│   │   └── authMiddleware.mjs   # JWT authentication and role authorization
│   ├── routes/
│   │   ├── authRoutes.mjs       # Authentication routes
│   │   └── chatRoutes.mjs       # Chat routes
│   ├── schemas/
│   │   ├── Message.mjs          # Message schema
│   │   └── User.mjs             # User schema
│   ├── services/
│   │   └── socketHandler.mjs    # Socket.IO event handlers
│   ├── utils/
│   │   └── jwt.mjs              # JWT token generation
├── .env                         # Environment variables
├── server.mjs                    # Application entry point
├── package.json                 # Project dependencies and scripts
└── README.md                    # This file
```