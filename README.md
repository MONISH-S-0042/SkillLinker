# SkillLinker

SkillLinker is a specialized job board platform that connects **Job Seekers** with **Job Posters**. It features **real-time communication**, a robust notification system, and automated job management.

## 🚀 Key Features

- **Dual-Role System**: Users can register as either a Seeker (looking for jobs) or a Poster (posting job opportunities).
- **Job Management**: Create, edit, and manage job listings with specific requirements, pay, and deadlines.
- **Real-Time Chat**: Integrated messaging system using Socket.io for instant communication between posters and seekers.
- **Automated Workflows**: Uses Agenda.js to automatically close job listings once deadlines pass.
- **Notification System**: Stay updated with alerts for applications and job status changes.
- **Profile Customization**: Users can upload profile pictures and resumes, managed via Cloudinary.
- **Responsive Web Design**: Built with EJS and custom CSS for a modern, accessible interface.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-Time**: Socket.io
- **Task Scheduling**: Agenda.js
- **File Storage**: Cloudinary (via Multer)
- **Authentication**: Passport.js (Local Strategy)
- **Templating**: EJS (with EJS Mate)

## 📁 Project Structure

```text
├── controllers/    # Route controllers (logic)
├── models/         # Mongoose schemas (User, Job, Chat, Application, etc.)
├── public/         # Static assets (images, styles, client-side JS)
├── routes/         # Express route definitions
├── views/          # EJS templates
├── agenda.js       # Background task configuration
├── app.js          # Main application entry point=
```

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) running locally or a MongoDB Atlas URI

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd SkillLinker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add your credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_KEY=your_key
   CLOUDINARY_SECRET=your_secret
   ```

4. **Run the application**:
   ```bash
   node app.js
   ```
   The server will start on `http://localhost:3000`.

## 📡 Socket.io Events

The chat system supports:
- `joinRoom`: Joins a private or general chat room.
- `send-msg`: Sends a message to the room.
- `chat-history`: Restores previous messages from MongoDB.

## 🕒 Background Jobs

The platform uses **Agenda.js** to handle time-sensitive tasks. Specifically, the `close job` task runs periodically to check for expired job deadlines and updates their status to `closed` automatically.

---
*Created with ❤️ .*
