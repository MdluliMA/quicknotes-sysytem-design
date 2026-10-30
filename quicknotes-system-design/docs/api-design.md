# QuickNotes API Design

## 1\. Overview

The production QuickNotes API lets authenticated users manage notes and tags.

* **Base URL:** `https://api.quicknotes.example/v1` (illustrative placeholder)
* **Format:** JSON
* **Authentication:** Bearer token
* **Content type:** `application/json`

## 2\. Endpoints

|Method|Path|Description|Success status|
|-|-|-|-|
|GET|`/v1/notes`|List the current user's notes; supports pagination and `?tag=study` filtering|`200 OK`|
|GET|`/v1/notes/{id}`|Get one note owned by the current user|`200 OK`|
|POST|`/v1/notes`|Create a note|`201 Created`|
|PATCH|`/v1/notes/{id}`|Update one or more fields of a note|`200 OK`|
|DELETE|`/v1/notes/{id}`|Delete a note|`204 No Content`|
|GET|`/v1/tags`|List the current user's tags|`200 OK`|
|POST|`/v1/tags`|Create a tag|`201 Created`|

## 3\. List Notes

**Request:** `GET /v1/notes?page=1\&limit=20`

Authentication is required. The server returns only notes belonging to the authenticated user.

**Example response (`200 OK`):**

```json
{
  "data": \[
    {
      "id": 101,
      "user\_id": 1,
      "title": "My first note",
      "body": "Learning to build an API.",
      "created\_at": "2026-10-28T10:00:00Z",
      "updated\_at": "2026-10-28T10:00:00Z"
    },
    {
      "id": 102,
      "user\_id": 1,
      "title": "Study plan",
      "body": "Complete the system design assignment.",
      "created\_at": "2026-10-28T11:00:00Z",
      "updated\_at": "2026-10-28T11:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 2 }
}
```

To filter by tag, use `GET /v1/notes?tag=study`.

## 4\. Create a Note

**Request:** `POST /v1/notes`

Headers: `Authorization: Bearer <token>` and `Content-Type: application/json`

**Example request body:**

```json
{
  "title": "My first note",
  "body": "Learning to build an API.",
  "tag\_ids": \[1, 2]
}
```

The title is required, must not be blank, and may contain at most 100 characters. The body is optional.

**Example response (`201 Created`):**

```json
{
  "data": {
    "id": 101,
    "user\_id": 1,
    "title": "My first note",
    "body": "Learning to build an API.",
    "tag\_ids": \[1, 2],
    "created\_at": "2026-10-28T10:00:00Z",
    "updated\_at": "2026-10-28T10:00:00Z"
  }
}
```

## 5\. Get One Note

**Request:** `GET /v1/notes/101`

**Success (`200 OK`):**

```json
{
  "data": {
    "id": 101,
    "user\_id": 1,
    "title": "My first note",
    "body": "Learning to build an API."
  }
}
```

If the note does not exist or is not visible to the user, return `404 Not Found` to avoid revealing another user's data.

## 6\. Update a Note

**Request:** `PATCH /v1/notes/101`

```json
{
  "title": "Updated title",
  "body": "Updated note content."
}
```

**Success (`200 OK`):**

```json
{
  "data": {
    "id": 101,
    "title": "Updated title",
    "body": "Updated note content."
  }
}
```

## 7\. Delete a Note

**Request:** `DELETE /v1/notes/101`

**Success:** `204 No Content`. The response has no body. The API verifies ownership before deletion.

## 8\. List and Create Tags

* `GET /v1/tags` returns the current user's tags with `200 OK`.
* `POST /v1/tags` accepts `{"name":"study"}` and returns the created tag with `201 Created`.

Example list response:

```json
{
  "data": \[
    { "id": 1, "name": "study" },
    { "id": 2, "name": "personal" }
  ]
}
```

## 9\. Error Status Codes

|Status|Meaning|Example|
|-|-|-|
|`400 Bad Request`|Invalid input or malformed JSON|Missing title or title longer than 100 characters|
|`401 Unauthorized`|Authentication is missing or invalid|No valid bearer token|
|`403 Forbidden`|Authenticated user lacks permission|Attempting an action explicitly disallowed by policy|
|`404 Not Found`|Resource is not found or not visible to user|Note ID does not exist|
|`500 Internal Server Error`|Unexpected server failure|Unhandled database/service failure|

**Example error body (`400 Bad Request`):**

```json
{
  "error": {
    "code": "VALIDATION\_ERROR",
    "message": "The request contains invalid data.",
    "details": \[
      {
        "field": "title",
        "message": "Title is required and must not exceed 100 characters."
      }
    ],
    "request\_id": "req\_example\_123"
  }
}
```

## 10\. Security and Consistency

* Use HTTPS for all traffic.
* Validate and normalize request data on the server.
* Use a proven authentication system and enforce note ownership on every request.
* Never store plain-text passwords; store strong password hashes.
* Apply rate limits and avoid exposing stack traces or secrets in errors.
* Use pagination for large note collections.



## 11.Additional API Notes



\- GET requests retrieve notes from the API.

\- POST requests send new note data to the API.

\- DELETE requests request the removal of a note.

\- HTTP status codes help identify successful requests and errors.

\- JSON is used to exchange data between the client and API.



### 12\. Error Handling



\- `400 Bad Request`: Returned when request parameters or payload are invalid.

\- `404 Not Found`: Returned when the requested resource does not exist.

\- `500 Internal Server Error`: Returned when an unhandled server error occurs.

\-

