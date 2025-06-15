# AI-Enhanced HRMS Platform

This is a comprehensive Human Resource Management System (HRMS) enhanced with AI-powered features to streamline HR processes, improve decision-making, and boost productivity.

## Features

- **Core HR Modules**: Employee Management, Attendance, Leave, and Payroll.
- **AI-Powered Tools**:
  - Performance Feedback Generator
  - HR Chatbot for instant support
  - Attrition Prediction
  - Anomaly Detection in HR data
- **Advanced Capabilities**:
  - Resume Parser for easy candidate screening
  - Centralized Document Management

---

## Tech Stack

- **Backend**: Node.js, Express, Prisma (with SQLite for dev)
- **Frontend**: React, Vite, Axios
- **AI/ML**: Placeholder services (can be extended with real models)

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/)

---

## Setup and Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd AI-Enhanced-HRMS-Platform
    ```

2.  **Install backend dependencies**:
    ```bash
    cd backend
    npm install
    ```

3.  **Set up the database**:
    - Run the initial migration to create the database schema:
      ```bash
      npx prisma migrate dev --name init
      ```
    - (Optional) Seed the database with sample data:
      ```bash
      npx prisma db seed
      ```

4.  **Configure backend environment variables**:
    - In the `backend` directory, copy `.env.example` to a new file named `.env`.
    - Open `.env` and fill in your `DATABASE_URL` (if not using the default SQLite) and a secure `JWT_SECRET`.
    - For AI-powered features like the feedback generator to work with a real AI provider, add your `AI_API_KEY`. Otherwise, they will use fallback placeholder logic.

    - **For AWS S3 integration** (document and resume storage), add the following variables:
      - `SUPABASE_URL`: Your Supabase project URL.
      - `SUPABASE_KEY`: Your Supabase `service_role` key for backend access.

5.  **Install frontend dependencies**:
    ```bash
    cd ../frontend
    npm install
    ```

---

## Running the Application (Development)

1.  **Start the backend server**:
    - From the `backend` directory:
      ```bash
      npm start
      ```
    - The backend will run on `http://localhost:5000` (or the `PORT` specified in your `.env`).

2.  **Start the frontend development server**:
    - From the `frontend` directory:
      ```bash
      npm run dev
      ```
    - The frontend will be accessible at `http://localhost:5173`.

---

## Deployment (Production)

1.  **Build the frontend**:
    - From the `frontend` directory, run the build command:
      ```bash
      npm run build
      ```
    - This will create an optimized `dist` folder ready for production.

2.  **Configure a production web server** (like Nginx or Apache) to:
    - Serve the static files from the `frontend/dist` directory.
    - Act as a reverse proxy for the backend API, forwarding requests from a path like `/api` to your running backend server (e.g., `http://localhost:5000`).

3.  **Run the backend in a production environment**:
    - Ensure your `.env` file is configured with a production database URL and a strong `JWT_SECRET`.
    - Use a process manager like [PM2](https://pm2.keymetrics.io/) to keep the backend server running reliably:
      ```bash
      npm install -g pm2
      pm2 start index.js --name hrms-backend
      ```
