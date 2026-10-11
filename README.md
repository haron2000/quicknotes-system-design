# QuickNotes System Design

## Project Description

QuickNotes is a simple web-based note management system designed to demonstrate how a frontend API client communicates with a REST API.

The project includes a JavaScript API client that can load, create, and delete notes using the JSONPlaceholder API. It also documents how a production-ready QuickNotes system could be designed, including its API, database model, and scalable architecture.

## Project Structure

text
quicknotes-system-design/
├── index.html
├── api.js
├── style.css
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md


## How to Run the API Client

No backend installation is required to run the API client because it uses the public JSONPlaceholder API.

### Option 1: Open the HTML file

Open `index.html` in a web browser.

### Option 2: Use VS Code Live Server

1. Open the project folder in VS Code.
2. Install the Live Server extension if it is not already installed.
3. Right-click `index.html`.
4. Select **Open with Live Server**.
5. Use the page in the browser to load, create, and delete notes.

The application communicates with:

`https://jsonplaceholder.typicode.com/posts`

JSONPlaceholder is used for demonstration purposes, so changes made with POST and DELETE are simulated and are not permanently stored on the server.

## API Documentation

The production API design is documented here:

* [API Design](docs/api-design.md)
* [Data Model](docs/data-model.md)
* [Architecture](docs/architecture.md)

## Features

The API client supports:

* Loading the first 10 notes from the API
* Creating a new note
* Deleting a note
* Loading, success, error, and empty states
* Form validation
* Disabling buttons while requests are running
* Displaying API response status codes
* Safe rendering of user data using `textContent`

## What I Learned

Through this project, I learned:

1. **How REST APIs work:** I learned how HTTP methods such as GET, POST, PUT, PATCH, and DELETE are used to interact with resources.
2. **How to handle API requests with JavaScript:** I practiced using `fetch`, async/await, error handling, and HTTP response status codes.
3. **How to design an API:** I learned how to document endpoints, request bodies, response formats, and common API errors.
4. **How to design a relational database:** I learned how primary keys, foreign keys, one-to-many relationships, and many-to-many relationships can be used to model application data.
5. **How scalable systems are designed:** I learned how load balancers, application servers, caches, database replicas, queues, and workers can work together to improve scalability and reliability.

## Technologies Used

* HTML5
* CSS3
* JavaScript
* Fetch API
* REST API
* JSON
* SQL

## Project Status

The frontend API client is complete, and the system design documentation covers the proposed production API, database model, and scalable architecture.
