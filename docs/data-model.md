# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational data model to store users, notes and tags.

The system has four main entities:

* `users` — stores account information.
* `notes` — stores notes created by users.
* `tags` — stores reusable labels for categorising notes.
* `note_tags` — connects notes to tags and represents the many-to-many relationship between them.

The design uses primary keys to uniquely identify records and foreign keys to maintain relationships between tables.

---

## 2. Entities and Columns

### Users

The `users` table stores information about people who use QuickNotes.

| Column        | Type         | Key         | Description              |
| ------------- | ------------ | ----------- | ------------------------ |
| id            | INTEGER      | Primary Key | Unique user identifier   |
| name          | VARCHAR(100) | —           | User's display name      |
| email         | VARCHAR(255) | UNIQUE      | User's email address     |
| password_hash | VARCHAR(255) | —           | Securely hashed password |
| created_at    | TIMESTAMP    | —           | Account creation time    |

---

### Notes

The `notes` table stores notes created by users.

| Column     | Type         | Key         | Description            |
| ---------- | ------------ | ----------- | ---------------------- |
| id         | INTEGER      | Primary Key | Unique note identifier |
| user_id    | INTEGER      | Foreign Key | User who owns the note |
| title      | VARCHAR(100) | —           | Note title             |
| body       | TEXT         | —           | Note content           |
| created_at | TIMESTAMP    | —           | Note creation time     |
| updated_at | TIMESTAMP    | —           | Last update time       |

The `user_id` column references `users.id`.

---

### Tags

The `tags` table stores reusable labels that can be assigned to notes.

| Column | Type        | Key         | Description           |
| ------ | ----------- | ----------- | --------------------- |
| id     | INTEGER     | Primary Key | Unique tag identifier |
| name   | VARCHAR(50) | UNIQUE      | Tag name              |

---

### Note Tags

The `note_tags` table is a junction table that connects notes and tags.

| Column  | Type    | Key         | Description  |
| ------- | ------- | ----------- | ------------ |
| note_id | INTEGER | Foreign Key | Related note |
| tag_id  | INTEGER | Foreign Key | Related tag  |

The combination of `note_id` and `tag_id` forms the composite primary key. This prevents the same tag from being assigned to the same note more than once.

---

## 3. Relationships

### User to Notes — One-to-Many

One user can create many notes, but each note belongs to one user.

text
users
  |
  | 1
  |
  | many
  v
notes


The relationship is implemented using the `user_id` foreign key in the `notes` table.

For example, user 1 can have notes 1, 2 and 3, while each of those notes belongs to user 1.

---

### Notes to Tags — Many-to-Many

A note can have multiple tags, and a tag can be assigned to multiple notes.

text
notes
  |
  | many
  |
  v
note_tags
  ^
  | many
  |
tags


The `note_tags` junction table is required because a relational database cannot directly represent this many-to-many relationship with a single foreign key.

For example:

* Note 1 can have the tags `work` and `important`.
* The `work` tag can be used by Notes 1, 4 and 7.

The `note_tags` table stores these associations.

---

## 4. SQL Table Definitions

The following SQL creates the four tables.

sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);


The foreign keys maintain referential integrity between related records, while the primary keys provide unique identifiers.

---

## 5. Example SQL Queries

### Query 1: Get all notes belonging to a user

sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY created_at DESC;


This query retrieves all notes owned by user 1, with the newest notes shown first.

---

### Query 2: Find all notes with a particular tag

sql
SELECT notes.id, notes.title, notes.body
FROM notes
JOIN note_tags
    ON notes.id = note_tags.note_id
JOIN tags
    ON note_tags.tag_id = tags.id
WHERE tags.name = 'work';


This query uses a `JOIN` to find all notes that have the `work` tag.

---

### Query 3: Count notes created by each user

sql
SELECT users.id, users.name, COUNT(notes.id) AS note_count
FROM users
LEFT JOIN notes
    ON users.id = notes.user_id
GROUP BY users.id, users.name;


The `LEFT JOIN` ensures that users who have not created any notes are still included in the results with a count of zero.

---

### Query 4: Find all tags used by a particular note

sql
SELECT tags.id, tags.name
FROM tags
JOIN note_tags
    ON tags.id = note_tags.tag_id
WHERE note_tags.note_id = 1;


This query retrieves all tags associated with note 1.

---

## 6. Indexes

An index should be created on `notes.user_id` because the application will frequently retrieve all notes belonging to a particular user.

sql
CREATE INDEX idx_notes_user_id
ON notes(user_id);


This index allows the database to find notes for a user more efficiently without scanning every row in the `notes` table.

An additional index can be created on `note_tags.tag_id` because queries that find all notes associated with a particular tag will frequently filter using this column.

sql
CREATE INDEX idx_note_tags_tag_id
ON note_tags(tag_id);


The composite primary key on `note_tags(note_id, tag_id)` also provides an index that is useful when searching associations by `note_id`.

---

## 7. SQL vs NoSQL

QuickNotes should use a **SQL relational database** such as PostgreSQL.

The application has clearly defined relationships between users, notes and tags. A relational database is well suited to these relationships because it provides primary keys, foreign keys, constraints, transactions and reliable joins.

The `users` to `notes` relationship and the many-to-many relationship between notes and tags can be represented cleanly using foreign keys and the `note_tags` junction table.

A NoSQL database could provide flexible schemas and easy horizontal scaling, but the structured relationships and consistency requirements of QuickNotes make a relational SQL database a better choice for the core application data.
