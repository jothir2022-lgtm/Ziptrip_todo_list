# API Reference

Base URL: `http://localhost:5000/api`

All endpoints return JSON with a `success` boolean field.

---

## Todo Object Shape

```json
{
  "id": "uuid-v4",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "medium",
  "dueDate": "2025-07-01T00:00:00.000Z",
  "tags": ["personal", "errands"],
  "completed": false,
  "completedAt": null,
  "createdAt": "2025-06-20T10:00:00.000Z",
  "updatedAt": "2025-06-20T10:00:00.000Z",
  "notes": "Check the dairy aisle first",
  "subtasks": [
    { "id": "1234", "text": "Get milk", "done": false }
  ]
}
```

---

## Endpoints

### `GET /api/todos`
List all todos. Supports query parameters for filtering and sorting.

**Query Parameters:**

| Param    | Type   | Description                              |
|----------|--------|------------------------------------------|
| status   | string | `all` (default), `active`, `completed`   |
| priority | string | `high`, `medium`, `low`                  |
| tag      | string | Filter by a specific tag                 |
| search   | string | Text search on title and description     |
| sortBy   | string | `createdAt` (default), `dueDate`, `priority`, `title` |
| order    | string | `asc`, `desc` (default)                  |

**Response:**
```json
{ "success": true, "data": [...todos], "count": 5 }
```

---

### `GET /api/todos/:id`
Get a single todo by ID.

**Response:**
```json
{ "success": true, "data": { ...todo } }
```

**Error (404):**
```json
{ "success": false, "error": "Todo not found" }
```

---

### `POST /api/todos`
Create a new todo.

**Body:**
```json
{
  "title": "Task title",
  "description": "Optional description",
  "priority": "medium",
  "dueDate": "2025-07-01",
  "tags": ["tag1", "tag2"]
}
```

- `title` is required; all other fields are optional.
- `priority` defaults to `"medium"` if omitted.

**Response (201):**
```json
{ "success": true, "data": { ...newTodo } }
```

---

### `PUT /api/todos/:id`
Update a todo. Send only the fields you want to change.

**Body (all optional):**
```json
{
  "title": "Updated title",
  "description": "Updated desc",
  "priority": "high",
  "dueDate": "2025-08-01",
  "tags": ["new-tag"],
  "completed": true,
  "notes": "Free-form notes",
  "subtasks": [{ "id": "abc", "text": "Step one", "done": false }]
}
```

**Response:**
```json
{ "success": true, "data": { ...updatedTodo } }
```

---

### `PATCH /api/todos/:id/toggle`
Toggle the `completed` status of a todo. Sets `completedAt` accordingly.

**Response:**
```json
{ "success": true, "data": { ...updatedTodo } }
```

---

### `DELETE /api/todos/:id`
Delete a todo by ID.

**Response:**
```json
{ "success": true, "data": { ...deletedTodo } }
```

---

### `DELETE /api/todos`
Delete **all completed** todos in one request.

**Response:**
```json
{ "success": true, "deleted": 3 }
```

---

### `GET /api/stats`
Returns aggregate counts.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 4,
    "active": 6,
    "highPriority": 2,
    "overdue": 1
  }
}
```

---

## Error Responses

| Status | Meaning                   |
|--------|---------------------------|
| 400    | Bad request (missing title) |
| 404    | Todo not found            |
| 500    | Internal server error     |
