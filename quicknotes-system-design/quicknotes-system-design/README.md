# QuickNotes System Design

## Description

QuickNotes System Design demonstrates a browser client that communicates with a practice REST API and documents a proposed production backend for a service targeting one million registered users.

The front end uses HTML, CSS, and JavaScript to load, create, and delete notes through JSONPlaceholder. The documents define the real API contract, relational data model, and scalable architecture.

> \\\*\\\*Practice API limitation:\\\*\\\* JSONPlaceholder simulates POST and DELETE requests. New notes and deletions are not permanently saved by its server. This client updates the current page to demonstrate the user experience.

## Project Files

```text
quicknotes-system-design/
├── index.html
├── api.js
├── style.css
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## How to Run the API Client

1. Download or clone this repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` with the VS Code Live Server extension, or use another local static web server.
4. Click **Load notes** to retrieve 10 posts.
5. Enter a title and optional body, then click **Create Note**.
6. Click **Delete** on a displayed note to simulate deleting it.

An internet connection is required to reach JSONPlaceholder.

## Design Documents

* [API Design](docs/api-design.md) — endpoints, JSON examples, status codes, and errors.
* [Data Model](docs/data-model.md) — entities, relationships, SQL tables, queries, and indexes.
* [Architecture](docs/architecture.md) — requirements, load estimates, diagram, request flows, trade-offs, and redundancy.

## What I Learned

* How to use `fetch`, `async/await`, and a reusable request function to call a REST API.
* How to handle loading, success, error, and empty states, validate input, and disable buttons while requests are running.
* How REST endpoint methods and HTTP status codes communicate API outcomes.
* How primary keys, foreign keys, joins, and indexes support a relational data model.
* How load balancers, caches, read replicas, queues, and workers help a service scale and recover from failures.
* Why a practice API may simulate writes without permanently storing changes.

## Git History

Make meaningful commits as you complete the work. Suggested messages:

1. `Add API client with GET`
2. `Add create note with POST`
3. `Add delete with DELETE`
4. `Add API design doc`
5. `Add data model doc`
6. `Add architecture doc`
7. `Add README`
8. \## Project Features
9. 
- Load notes from a REST API.
- Create new notes using a POST request.
- Delete notes using a DELETE request.
- Display loading, success, and error messages.
- Document the API, database model, and system architecture.

10. \## Learning Goals

This project demonstrates REST API design, asynchronous JavaScript,

database relationships, system architecture, and Git version control.

