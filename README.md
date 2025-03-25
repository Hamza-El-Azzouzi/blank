# Social Network

A Facebook-like social network application built with Go (backend) and Next.js (frontend).

## Overview

This project implements a comprehensive social network with features like user profiles, posts, groups, messaging, notifications, and more. It's designed with a modern architecture featuring a Go backend API and a Next.js frontend.

## Features

### Authentication
- User registration and login
- Session management with cookies
- Public and private profile options

### Profiles
- User information display
- Profile avatars and about sections
- Follow/unfollow functionality
- Private/public profile settings

### Posts
- Create, view, and interact with posts
- Support for text and image content
- Privacy levels: public, almost private (followers only), private (selected followers)
- Like and comment on posts

### Groups
- Create and join groups
- Group posts and comments
- Member management
- Group events with attendance tracking
- Group chat

### Chat System
- Real-time private messaging
- Group chat functionality
- Message status (read/unread)
- Emoji support

### Notifications
- Follow requests
- Group invitations
- Event creation
- Join requests

## Technical Stack

### Backend
- **Language**: Go
- **Database**: SQLite
- **Dependencies**:
  - Standard Go packages
  - Gorilla WebSocket
  - golang-migrate / sql-migration
  - bcrypt
  - uuid

### Frontend
- **Framework**: Next.js (React)
- **State Management**: React Hooks
- **Styling**: Custom CSS
- **Dependencies**:
  - React Icons
  - React components

## Architecture

### Backend Structure
- RESTful API endpoints
- WebSocket server for real-time features
- SQLite database with migration system
- Session-based authentication

### Frontend Structure
- Next.js app router structure
- Client-side rendering for dynamic content
- WebSocket connection for real-time updates
- Responsive design for all devices

## Setup and Installation

### Prerequisites
- Go (1.20+)
- Node.js (18+)
- npm or yarn
- Docker and Docker Compose (optional, for containerized setup)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   go mod download
   ```

3. Run the application:
   ```
   go run main.go
   ```

   This will start the server on port 1414.

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

   This will start the Next.js application on port 3000.

### Docker Setup
1. Build and run using Docker Compose:
   ```
   docker-compose up -d
   ```
   
   This will set up both backend and frontend services.

## API Documentation

### Authentication
- `POST /api/register` - Create a new user account
- `POST /api/login` - Authenticate a user
- `POST /api/logout` - End a user session

### Users
- `GET /api/user-info/{id}` - Get user profile information
- `GET /api/authenticated-user` - Get current user information
- `PUT /api/user-update-info` - Update user profile information

### Posts
- `GET /api/posts/{page}` - Get paginated posts
- `POST /api/createpost` - Create a new post
- `GET /api/user-posts/{id}/{page}` - Get paginated posts by user

### Comments
- `GET /api/comment/{post_id}/{page}/{target}` - Get comments for a post
- `POST /api/comment/create` - Create a new comment
- `POST /api/comment/{comment_id}/like/{target}` - Like a comment

### Follow System
- `POST /api/requestfollow` - Send a follow request
- `PUT /api/acceptfollow` - Accept a follow request
- `DELETE /api/refusefollow` - Refuse a follow request
- `GET /api/followerlist/{userId}` - Get a user's followers
- `GET /api/followinglist/{userId}` - Get users followed by a user

### Groups
- `POST /api/createGroup` - Create a new group
- `GET /api/groups/{page}` - Get paginated groups
- `GET /api/group/{group_id}` - Get group details
- `POST /api/group/create/post` - Create a post in a group
- `GET /api/group/{group_id}/post/{page}` - Get paginated group posts
- `POST /api/group/createEvent` - Create a group event
- `GET /api/group/{group_id}/event/{page}` - Get group events
- `POST /api/group/{group_id}/event/response` - Respond to an event invitation

### Messages
- `GET /api/chat/contacts` - Get chat contacts
- `GET /api/chat/{user_id}` - Get messages with a user
- `GET /api/chat/groups` - Get group chats
- `GET /api/chat/group/{group_id}` - Get group chat messages

### Notifications
- `GET /api/notifications/{page}` - Get user notifications
- `PUT /api/notifications/{id}/see` - Mark notification as seen

## WebSocket API

The application uses WebSockets for real-time features like chat and notifications. The main WebSocket endpoint is `/ws`.

## Database Schema

The database uses SQLite with the following main tables:
- `User` - User accounts and profile information
- `Session` - Active user sessions
- `Post` - User posts
- `Comment` - Comments on posts
- `Follow` - User follow relationships
- `Group` - Groups and their details
- `Group_Membership` - Group member associations
- `Group_Post` - Posts within groups
- `Event` - Group events
- `Event_Response` - User responses to events
- `Message` - Private and group messages
- `Notification` - User notifications
- `Like` - Post, comment, and group post likes

## License

This project is for educational purposes.

## Contributors

This social network project was developed by:

- [Yassine El Mach](https://github.com/yelmach)
- [Hamza Maach](https://github.com/hmaach)
- [Hamza Khlifi](https://github.com/khlifihamza)
- [Hamza El Azzouzi](https://github.com/Hamza-El-Azzouzi)
