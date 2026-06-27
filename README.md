# Enhanced — Full-Stack Todo Application

A multi-page todo application with a **React** frontend and **Node.js/Express** backend. Data is persisted in a local JSON file.

---

## Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | React 18, React Router v6 |
| Backend   | Node.js, Express 4  |
| Storage   | JSON file (via `fs`) |
| Styling   | Custom CSS (dark theme) |

---

## Project Structure

```
todo-app/
├── backend/
│   ├── src/
│   │   └── index.js        # Express server + all API routes
│   ├── data/
│   │   └── todos.json      # Persistent data file (auto-created)
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js          # Router setup (multi-page)
│   │   ├── index.js
│   │   ├── api.js          # API utility functions
│   │   ├── styles/
│   │   │   └── global.css
│   │   └── pages/
│   │       ├── TodoListPage.js    # Page 1: All todos
│   │       └── TodoDetailPage.js  # Page 2: Single todo (?id=...)
│   └── package.json
├── docs/
│   ├── API.md              # Backend API reference
│   └── FEATURES.md         # Full feature documentation
└── README.md
```

---

## Quick Start

### 1. Start the Backend

```bash
cd backend
npm install
npm start
# API runs at http://localhost:5000
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start
# App runs at http://localhost:3000
```

The frontend proxies `/api` requests to the backend via the `"proxy"` field in `frontend/package.json`.

---

## Pages

| Route         | Description                                          |
|---------------|------------------------------------------------------|
| `/`           | Todo list page — view, filter, create, delete todos  |
| `/todo?id=:id`| Single todo detail page — view and edit a specific todo |

---

## Documentation

- [Features & Functionalities](./docs/FEATURES.md)
- [API Reference](./docs/API.md)
