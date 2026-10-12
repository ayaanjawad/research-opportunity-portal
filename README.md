# Research Portal

A full-stack web application for browsing and managing undergraduate research opportunities, built with **Flask** (Python) and **MySQL**.

> **Course:** Computer Network — Assignment 1  
> **Student:** Ayaan Jawad  
> **Roll No:** 24P-0505  
> **Class:** BSCS-5B  

## GitHub Repository

🔗 https://github.com/ayaanjawad/research-opportunity-portal

---

## Demo Video

📹 

> **Note:** The frontend fully supports Create, Edit, Close and Delete operations through its built-in form and action buttons. Due to the one-minute video limit, the demo walks through the same operations via Postman to show every API request and response clearly.

---

## Features

- **CRUD Operations** — Create, Read, Update, and Delete research opportunities via REST API
- **View Full Details** — Click "View" to see complete details of any opportunity in a modal
- **Close Opportunities** — Dedicated "Close" button to mark open opportunities as closed
- **Search & Filter** — Search by title, area, faculty or department; filter by status and department
- **Form Validation** — Client-side JavaScript validation with error messages for empty fields, invalid positions, and past deadlines
- **Server-side Validation** — Status enum check, deadline date format check, safe integer parsing
- **Responsive Design** — Modern, clean UI that works on desktop and mobile

---

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Backend   | Python 3, Flask, Flask-CORS   |
| Database  | MySQL                         |
| Frontend  | HTML5, CSS3, Vanilla JS       |
| Config    | python-dotenv (.env)          |

---

## Prerequisites

- **Python 3.8+**
- **MySQL 5.7+** or **MariaDB 10.3+**
- **pip** (Python package manager)

---

## Setup & Run

### 1. Clone the repository

```bash
git clone https://github.com/ayaanjawad/research-opportunity-portal.git
cd research-opportunity-portal
```

### 2. Create the database

Open MySQL and run the schema file:

```bash
mysql -u root -p < schema.sql
```

Or paste the contents of `schema.sql` directly into the MySQL shell. This creates the `research_portal` database and the `research_opportunities` table.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=research_portal
```

> ⚠️ **Never commit `.env` to Git.** It is already listed in `.gitignore`.

### 4. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the application

```bash
python app.py
```

### 6. Open in browser

```
http://localhost:5000
```

---

## API Endpoints

| Method   | Endpoint                     | Description                       | Success Code |
|----------|------------------------------|-----------------------------------|--------------|
| `GET`    | `/api/opportunities`         | List all opportunities            | 200          |
| `GET`    | `/api/opportunities/:id`     | Get a single opportunity by ID    | 200          |
| `POST`   | `/api/opportunities`         | Create a new opportunity          | 201          |
| `PUT`    | `/api/opportunities/:id`     | Update an existing opportunity    | 200          |
| `DELETE` | `/api/opportunities/:id`     | Delete an opportunity             | 200          |

### Error Codes

| Code | Meaning                                      |
|------|----------------------------------------------|
| 400  | Validation error (missing field, bad status, bad date, etc.) |
| 404  | Opportunity not found                        |
| 500  | Server / database error                      |

---

## Project Structure

```
research-opportunity-portal/
├── app.py                  # Flask backend with all API routes
├── schema.sql              # MySQL database schema
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variable template (safe to commit)
├── .env                    # Actual credentials (DO NOT commit)
├── .gitignore              # Ignores .env, __pycache__, venv, etc.
├── postman_collection.json # Postman/Bruno API collection for testing
├── README.md               # This file
└── frontend/
    ├── index.html           # Main HTML page
    ├── style.css            # Styles (dark theme, responsive)
    └── script.js            # Frontend logic (CRUD, validation, modals)
```

---

## Postman / Bruno Collection

A ready-to-import API collection is included:

📄 **`postman_collection.json`**

Import it into [Postman](https://www.postman.com/) or [Bruno](https://www.usebruno.com/) to test all five CRUD endpoints.

---

## License

This project was created for academic purposes as part of a university assignment.
