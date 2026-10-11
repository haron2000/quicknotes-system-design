# QuickNotes API Design

## 1. Overview

The QuickNotes API is a RESTful API that allows authenticated users to create, view, update and delete notes. The API returns JSON responses and uses standard HTTP status codes to communicate the result of each request.

The API base URL is:

text
https://api.quicknotes.example.com/api


Authentication is assumed for endpoints that access or modify a user's notes.

---

## 2. REST Endpoints

| Method | Path          | Description                                    | Success Status |
| ------ | ------------- | ---------------------------------------------- | -------------- |
| GET    | `/notes`      | List notes belonging to the authenticated user | 200 OK         |
| GET    | `/notes/{id}` | Retrieve one note by ID                        | 200 OK         |
| POST   | `/notes`      | Create a new note                              | 201 Created    |
| PUT    | `/notes/{id}` | Replace an existing note                       | 200 OK         |
| PATCH  | `/notes/{id}` | Partially update an existing note              | 200 OK         |
| DELETE | `/notes/{id}` | Delete an existing note                        | 204 No Content |

---

## 3. GET /notes

Returns a list of notes belonging to the authenticated user.

### Request

http
GET /api/notes
Authorization: Bearer <token>
Accept: application/json


### Successful Response

**Status: 200 OK**

json
{
  "notes": [
    {
      "id": 1,
      "title": "Meeting notes",
      "body": "Discuss the project requirements.",
      "user_id": 10,
      "created_at": "2026-10-11T08:30:00Z",
      "updated_at": "2026-10-11T08:30:00Z"
    },
    {
      "id": 2,
      "title": "Shopping list",
      "body": "Milk, bread and vegetables.",
      "user_id": 10,
      "created_at": "2026-10-11T09:00:00Z",
      "updated_at": "2026-10-11T09:00:00Z"
    }
  ]
}


---

## 4. GET /notes/{id}

Returns one note using its unique ID.

### Request

http
GET /api/notes/1
Authorization: Bearer <token>
Accept: application/json

### Successful Response

**Status: 200 OK**

json
{
  "id": 1,
  "title": "Meeting notes",
  "body": "Discuss the project requirements.",
  "user_id": 10,
  "created_at": "2026-10-11T08:30:00Z",
  "updated_at": "2026-10-11T08:30:00Z"
}


---

## 5. POST /notes

Creates a new note for the authenticated user.

### Request

http
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json


### Request Body

json
{
  "title": "Project ideas",
  "body": "Research possible features for QuickNotes."
}

### Successful Response

**Status: 201 Created**

json
{
  "id": 25,
  "title": "Project ideas",
  "body": "Research possible features for QuickNotes.",
  "user_id": 10,
  "created_at": "2026-10-11T10:15:00Z",
  "updated_at": "2026-10-11T10:15:00Z"
}


---

## 6. PUT /notes/{id}

Completely replaces an existing note.

### Request

http
PUT /api/notes/25
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json

### Request Body

json
{
  "title": "Updated project ideas",
  "body": "Research possible features and user requirements."
}


### Successful Response

**Status: 200 OK**

json
{
  "id": 25,
  "title": "Updated project ideas",
  "body": "Research possible features and user requirements.",
  "user_id": 10,
  "created_at": "2026-10-11T10:15:00Z",
  "updated_at": "2026-10-11T10:30:00Z"
}

---

## 7. PATCH /notes/{id}

Partially updates an existing note. Only the fields that need to change must be included.

### Request

http
PATCH /api/notes/25
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json


### Request Body

json
{
  "title": "Final project ideas"
}


### Successful Response

**Status: 200 OK**

json
{
  "id": 25,
  "title": "Final project ideas",
  "body": "Research possible features and user requirements.",
  "user_id": 10,
  "created_at": "2026-10-11T10:15:00Z",
  "updated_at": "2026-10-11T10:35:00Z"
}


---

## 8. DELETE /notes/{id}

Deletes an existing note belonging to the authenticated user.

### Request

http
DELETE /api/notes/25
Authorization: Bearer <token>


### Successful Response

**Status: 204 No Content**

The server successfully deletes the note and returns no response body.

---

## 9. Error Status Codes

The API uses standard HTTP status codes to communicate errors.

| Status | Meaning               | Example                                              |
| ------ | --------------------- | ---------------------------------------------------- |
| 400    | Bad Request           | Required field is missing or invalid                 |
| 401    | Unauthorized          | Authentication token is missing or invalid           |
| 403    | Forbidden             | User is authenticated but cannot access the resource |
| 404    | Not Found             | Requested note does not exist                        |
| 500    | Internal Server Error | Unexpected server-side failure                       |

### 400 Bad Request

For example, if a note is submitted without a title:

json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required."
  }
}


### 401 Unauthorized

Returned when authentication is missing or invalid:

json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  }
}


### 403 Forbidden

Returned when a user attempts to access a note they do not have permission to access:

json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this note."
  }
}


### 404 Not Found

Returned when the requested note does not exist:

json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Note not found."
  }
}


### 500 Internal Server Error

Returned when the server encounters an unexpected problem:

json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}


---

## 10. API Design Principles

The QuickNotes API follows REST principles by using HTTP methods according to the operation being performed:

* `GET` retrieves resources.
* `POST` creates resources.
* `PUT` replaces resources.
* `PATCH` partially updates resources.
* `DELETE` removes resources.

Resources are represented using nouns such as `notes`, while HTTP methods describe the action being performed.

The API returns JSON and uses standard HTTP status codes so that clients can understand whether a request succeeded or failed.

Authentication and authorization are applied to user-specific note operations to ensure that users can only access and modify notes they are permitted to use.
