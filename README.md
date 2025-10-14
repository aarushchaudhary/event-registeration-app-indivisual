# Event Registration & Leaderboard Web App

A full-stack web application designed for managing student registrations for an event. It features a dynamic registration form, a public leaderboard, and a secure admin panel for managing participants and their scores.

-----

## Features

  - **Student Registration:** A clean, responsive form with dynamic, conditional fields based on the student's academic year and course.
  - **Input Validation:** Frontend and backend validation for specific fields like SAP ID and NMIMS Email.
  - **Payment Handling:** Includes a section for payment via QR code and requires users to upload a payment screenshot and transaction ID.
  - **Public Leaderboard:** A visually appealing leaderboard that highlights the top 3 participants.
  - **Secure Admin Panel:** A password-protected dashboard for event organizers with the following capabilities:
      - Secure login using JWT (JSON Web Tokens).
      - View a table of all registered students and their details.
      - Click to view uploaded payment screenshots.
      - Manage the leaderboard by adding points to participants.
      - Export both the registration list and the leaderboard data to Excel spreadsheets (`.xlsx`).
      - A logout function to securely end the admin session.

-----

## Tech Stack

This project is built with the following technologies:

  - **Frontend:**
      - HTML5
      - Tailwind CSS
      - Vanilla JavaScript (for DOM manipulation and API calls)
  - **Backend:**
      - Node.js
      - Express.js
  - **Database:**
      - MongoDB (with Mongoose ODM)
  - **Key Libraries:**
      - `jsonwebtoken` for admin authentication
      - `bcryptjs` for hashing sensitive data
      - `multer` for handling file uploads
      - `exceljs` for exporting data to Excel
      - `dotenv` for managing environment variables

-----

## Project Structure

```
aptitude-test-form/
├── .gitignore
├── package.json
├── README.md
├── backend/
│   ├── .env
│   ├── server.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   └── registrationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── leaderboard.js
│   │   └── registration.js
│   └── routes/
│       ├── adminRoutes.js
│       └── registrationRoutes.js
└── frontend/
    ├── admin.html
    ├── index.html
    ├── leaderboard.html
    ├── register.html
    ├── css/
    │   └── style.css
    ├── js/
    │   └── main.js
    └── media/
        └── (Your images and logos here)
```

-----

## Setup and Installation

Follow these steps to get the project running on your local machine.

### Prerequisites

  - Node.js and npm installed ([https://nodejs.org/](https://nodejs.org/))
  - MongoDB (either a local instance or a free cloud instance from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation Steps

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd aptitude-test-form
    ```

2.  **Install dependencies:**
    This command installs all the required backend packages from `package.json`.

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a new file named `.env` inside the `backend/` directory and add the following variables.

    ```text
    # MongoDB Connection String (replace with your own)
    MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/yourDatabaseName"

    # Server Port
    PORT=3000

    # Admin Credentials for the login page
    ADMIN_USER="your_admin_username"
    ADMIN_PASS="your_admin_password"

    # JWT Secret for securing the admin session (can be any long, random string)
    JWT_SECRET="this_is_a_very_secret_key_for_jwt"

    # Total number of seats for the event
    TOTAL_EVENT_SEATS=200
    ```

4.  **Add Media Files:**
    Place your images (background, logos, QR code) inside the `frontend/media/` folder.

5.  **Run the Application:**

      - **For development (recommended):**
        This command uses `nodemon` to automatically restart the server whenever you make changes to a file.

        ```bash
        npm run dev
        ```

      - **For production:**

        ```bash
        npm start
        ```

The application will be running on `http://localhost:3000`.

-----

## Usage

  - **Home Page:** `http://localhost:3000`
  - **Registration Form:** `http://localhost:3000/register.html`
  - **Leaderboard:** `http://localhost:3000/leaderboard.html`
  - **Admin Panel:** `http://localhost:3000/admin.html`

-----

## Author

**Aarush Chaudhary**

© 2025 Aarush Chaudhary, STME NMIMS Hyderabad