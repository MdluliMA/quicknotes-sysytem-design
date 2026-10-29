// JSONPlaceholder is a practice API. It simulates requests but does not
// permanently store notes created or deleted through this client.
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const notesList = document.getElementById("notes-list");
const statusMessage = document.getElementById("status");

let notes = [];

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

// Reusable request helper: checks HTTP status and returns parsed JSON.
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }
  if (response.status === 204) {
    return { data: null, status: response.status };
  }
  return { data: await response.json(), status: response.status };
}

function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "No notes to display. Load or create a note.";
    notesList.appendChild(emptyItem);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    item.className = "note";

    const title = document.createElement("h3");
    title.textContent = note.title || "Untitled";

    const body = document.createElement("p");
    body.textContent = note.body || "No body provided.";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.id = String(note.id);

    item.append(title, body, deleteButton);
    notesList.appendChild(item);
  });
}

// GET: load up to 10 notes.
async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...");
  try {
    const result = await request(`${API_URL}?_limit=10`);
    notes = result.data;
    renderNotes();
    if (notes.length === 0) {
      showStatus("No notes were found.", "success");
    } else {
      showStatus(`Loaded ${notes.length} notes from the server.`, "success");
    }
  } catch (error) {
    showStatus("Unable to load notes. Check your connection and try again.", "error");
  } finally {
    loadButton.disabled = false;
  }
}

// POST: create a note. JSONPlaceholder returns a simulated record (usually ID 101).
async function createNote(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showStatus("Please enter a note title.", "error");
    titleInput.focus();
    return;
  }
  if (title.length > 100) {
    showStatus("The title must not exceed 100 characters.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  showStatus("Creating note...");
  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 })
    });
    notes.unshift(result.data);
    renderNotes();
    showStatus(`Note created (status ${result.status}, id ${result.data.id}).`, "success");
    noteForm.reset();
  } catch (error) {
    showStatus("Unable to create the note. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
  }
}

// DELETE: the API simulates deletion; remove the note from this page only.
async function deleteNote(noteId, button) {
  button.disabled = true;
  showStatus("Deleting note...");
  try {
    const result = await request(`${API_URL}/${encodeURIComponent(noteId)}`, {
      method: "DELETE"
    });
    notes = notes.filter((note) => String(note.id) !== String(noteId));
    renderNotes();
    showStatus(`Note ${noteId} deleted (status ${result.status}).`, "success");
  } catch (error) {
    showStatus("Unable to delete the note. Please try again.", "error");
  } finally {
    button.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

notesList.addEventListener("click", (event) => {
  if (event.target.matches(".delete-btn")) {
    deleteNote(event.target.dataset.id, event.target);
  }
});

renderNotes();
