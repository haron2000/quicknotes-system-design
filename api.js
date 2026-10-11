const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const status = document.getElementById("status");
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");

let notes = [];

function showStatus(message, type = "") {
status.textContent = message;
status.className = type;
}

function renderNotes() {
notesList.replaceChildren();

if (notes.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No notes found.";
    notesList.appendChild(emptyMessage);
    return;
}

notes.forEach((note) => {
    const listItem = document.createElement("li");

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.dataset.id = note.id;

    deleteBtn.addEventListener("click", () => {
        deleteNote(note.id, deleteBtn);
    });

    listItem.appendChild(title);
    listItem.appendChild(body);
    listItem.appendChild(deleteBtn);

    notesList.appendChild(listItem);
});

}

async function request(url, options = {}) {
const response = await fetch(url, options);

if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
}

return response;

}

async function loadNotes() {
loadBtn.disabled = true;
showStatus("Loading notes...", "loading");

try {
    const response = await request(`${API_URL}?_limit=10`);
    notes = await response.json();

    renderNotes();

    if (notes.length === 0) {
        showStatus("No notes were found.", "success");
    } else {
        showStatus(`Loaded ${notes.length} notes from the server.`, "success");
    }
} catch (error) {
    notes = [];
    renderNotes();
    showStatus("Sorry, we could not load the notes. Please try again.", "error");
} finally {
    loadBtn.disabled = false;
}

}

async function createNote(event) {
event.preventDefault();

const title = titleInput.value.trim();
const body = bodyInput.value.trim();

if (!title) {
    showStatus("A title is required.", "error");
    titleInput.focus();
    return;
}

if (title.length > 100) {
    showStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
}

submitBtn.disabled = true;
showStatus("Creating note...", "loading");

try {
    const response = await request(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            body: body,
            userId: 1
        })
    });

    const newNote = await response.json();

    notes.unshift(newNote);
    renderNotes();

    showStatus(
        `Note created (status ${response.status}, id ${newNote.id}).`,
        "success"
    );

    noteForm.reset();
} catch (error) {
    showStatus(
        "Sorry, we could not create the note. Please try again.",
        "error"
    );
} finally {
    submitBtn.disabled = false;
}

}

async function deleteNote(noteId, deleteBtn) {
deleteBtn.disabled = true;
showStatus("Deleting note...", "loading");

try {
    const response = await request(`${API_URL}/${noteId}`, {
        method: "DELETE"
    });

    // JSONPlaceholder simulates DELETE successfully but does not permanently
    // remove the resource from its server. We therefore remove it locally
    // from the page after receiving a successful response.
    notes = notes.filter((note) => note.id !== noteId);
    renderNotes();

    showStatus(
        `Note deleted (status ${response.status}).`,
        "success"
    );
} catch (error) {
    showStatus(
        "Sorry, we could not delete the note. Please try again.",
        "error"
    );
    deleteBtn.disabled = false;
}


}

loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
