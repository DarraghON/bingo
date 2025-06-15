# Multi-User Interactive Bingo App

## Features
- 13 users, each with a personal bingo card
- Users can see and mark all cards except their own
- Real-time updates via Socket.IO
- Simple authentication (demo: hardcoded users)

## Quick Start

### 1. Backend

```bash
cd server
npm install
node index.js
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```
*(or `npm start` if using Create React App)*

### 3. Open the App

Visit: [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/server` - Express + Socket.IO backend
- `/client` - React frontend

## Notes

- Demo users: `user1`–`user13`, password: `password`
- Data is in-memory; for production, use a database
- Adjust ports as needed in server/client configs