# QuickNotes Data Model

## 1\. Overview

QuickNotes stores registered users, notes, tags, and the links between notes and tags in a relational database. The examples below use SQLite-compatible SQL; a production deployment could use PostgreSQL.

## 2\. Entities and Columns

### Users

|Column|Type|Key/constraint|Purpose|
|-|-|-|-|
|`user\_id`|INTEGER|Primary key|Unique user ID|
|`username`|VARCHAR(50)|NOT NULL, UNIQUE|Display/login name|
|`email`|VARCHAR(255)|NOT NULL, UNIQUE|Account email|
|`password\_hash`|VARCHAR(255)|NOT NULL|Password hash, never plaintext|
|`created\_at`|TIMESTAMP|NOT NULL|Account creation time|

### Notes

|Column|Type|Key/constraint|Purpose|
|-|-|-|-|
|`note\_id`|INTEGER|Primary key|Unique note ID|
|`user\_id`|INTEGER|Foreign key, NOT NULL|Owner|
|`title`|VARCHAR(100)|NOT NULL|Required title|
|`body`|TEXT|Nullable|Optional note body|
|`created\_at`|TIMESTAMP|NOT NULL|Creation time|
|`updated\_at`|TIMESTAMP|NOT NULL|Last update time|

### Tags

|Column|Type|Key/constraint|Purpose|
|-|-|-|-|
|`tag\_id`|INTEGER|Primary key|Unique tag ID|
|`user\_id`|INTEGER|Foreign key, NOT NULL|Tag owner|
|`name`|VARCHAR(50)|NOT NULL|Tag name|

The combination of `user\_id` and `name` is unique.

### Note\_Tags

|Column|Type|Key/constraint|Purpose|
|-|-|-|-|
|`note\_id`|INTEGER|Composite primary key part; foreign key|Linked note|
|`tag\_id`|INTEGER|Composite primary key part; foreign key|Linked tag|

The composite primary key is (`note\_id`, `tag\_id`).

## 3\. Relationships

* **One-to-many:** One user can own many notes; each note belongs to one user.
* **One-to-many:** One user can create many tags; each tag belongs to one user.
* **Many-to-many:** A note can have many tags, and each tag can be attached to many notes. `note\_tags` is the junction table that implements this relationship.

## 4\. CREATE TABLE Statements

```sql
PRAGMA foreign\_keys = ON;

CREATE TABLE users (
    user\_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password\_hash VARCHAR(255) NOT NULL,
    created\_at TIMESTAMP NOT NULL DEFAULT CURRENT\_TIMESTAMP
);

CREATE TABLE notes (
    note\_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user\_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL
        CHECK (length(trim(title)) BETWEEN 1 AND 100),
    body TEXT,
    created\_at TIMESTAMP NOT NULL DEFAULT CURRENT\_TIMESTAMP,
    updated\_at TIMESTAMP NOT NULL DEFAULT CURRENT\_TIMESTAMP,
    FOREIGN KEY (user\_id) REFERENCES users(user\_id) ON DELETE CASCADE
);

CREATE TABLE tags (
    tag\_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user\_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 50),
    UNIQUE (user\_id, name),
    FOREIGN KEY (user\_id) REFERENCES users(user\_id) ON DELETE CASCADE
);

CREATE TABLE note\_tags (
    note\_id INTEGER NOT NULL,
    tag\_id INTEGER NOT NULL,
    PRIMARY KEY (note\_id, tag\_id),
    FOREIGN KEY (note\_id) REFERENCES notes(note\_id) ON DELETE CASCADE,
    FOREIGN KEY (tag\_id) REFERENCES tags(tag\_id) ON DELETE CASCADE
);
```

## 5\. Example SQL Queries

### Query 1: List a user's notes, newest first

```sql
SELECT note\_id, title, body, created\_at
FROM notes
WHERE user\_id = 1
ORDER BY created\_at DESC;
```

### Query 2: JOIN notes with their tags

```sql
SELECT n.title, t.name AS tag\_name
FROM notes AS n
JOIN note\_tags AS nt ON nt.note\_id = n.note\_id
JOIN tags AS t ON t.tag\_id = nt.tag\_id
WHERE n.user\_id = 1
ORDER BY n.title, t.name;
```

### Query 3: Count notes per user, including users with no notes

```sql
SELECT u.username, COUNT(n.note\_id) AS total\_notes
FROM users AS u
LEFT JOIN notes AS n ON n.user\_id = u.user\_id
GROUP BY u.user\_id, u.username
ORDER BY total\_notes DESC;
```

### Query 4: Search titles for a word

```sql
SELECT note\_id, title
FROM notes
WHERE user\_id = 1 AND title LIKE '%study%';
```

## 6\. Index

```sql
CREATE INDEX idx\_notes\_user\_created
ON notes(user\_id, created\_at DESC);
```

This index supports the common query that lists one user's notes ordered by creation time. It can reduce the amount of data the database must scan as the notes table grows.

## 7\. SQL vs NoSQL

QuickNotes should start with a relational SQL database such as PostgreSQL. Its data has clear relationships, and foreign keys, uniqueness constraints, and transactions help keep the data consistent. SQL JOINs also make it easy to retrieve notes with their tags. At one million users, PostgreSQL can be scaled with suitable indexes, connection pooling, caching, read replicas, and query tuning. NoSQL may suit some flexible or specialized high-volume workloads, but SQL is the better default for this structured model.



### **8.Data Integrity**



\- Primary keys uniquely identify each record.

\- Foreign keys connect related tables.

\- NOT NULL prevents required fields from being empty.

\- UNIQUE constraints prevent duplicate values.

\- Relationships help maintain consistent data.

