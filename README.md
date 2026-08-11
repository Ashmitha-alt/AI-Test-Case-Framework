# AI Test Case Management System (TMS)

A full-stack test management tool that helps QA engineers create better test artifacts faster. Describe a scenario in plain English and the system suggests a title, test steps, expected result, priority, and test type, backed by a local LLM (Ollama with Llama 3) for full generation and a lightweight rules engine for instant fallback suggestions.

Built as a personal project to combine hands-on QA and test-management experience with applied AI engineering: a Spring Boot REST API, a React frontend, and a real local-LLM integration rather than a hardcoded demo.

## What it does

The system supports full CRUD for test artifacts (Test Case, Defect, or Task), including priority, test type, preconditions, environment, and tags. A rule-based suggestion endpoint at POST /api/testcases/suggest applies keyword heuristics over a description to instantly suggest a title, priority, and test type. A second endpoint, POST /api/testcases/ai-generate, sends the summary to a local Ollama instance running Llama 3, using a strict prompt that forces structured JSON output covering title, numbered steps, expected result, priority, test type, and a confidence score. In the UI, live AI suggestions appear as you type a summary: the frontend debounces for 700ms and calls the AI-generate endpoint automatically, showing a Live Suggestions panel with a one-click Apply Suggestion button. Saved test cases appear in a list with inline edit and delete.

## Tech stack

Backend: Java 17, Spring Boot 3.3.2, Spring Web (REST), Spring Data JPA, Spring WebFlux (WebClient for calling Ollama), H2 in-memory database, and Jackson.

Frontend: React 19, Vite 8, plain CSS, and ESLint.

AI: Ollama (https://ollama.com) running the llama3 model locally at http://localhost:11434.

## Architecture

The React frontend (localhost:5173) talks REST/JSON to the Spring Boot backend (localhost:8080). The backend persists data through Spring Data JPA into an H2 in-memory database, and separately calls a local Ollama instance (localhost:11434, llama3 model) over HTTP via WebClient whenever AI generation is requested. The frontend never talks to Ollama directly: every AI call is proxied and post-processed by the backend, which cleans up and validates the model's JSON output before returning it.

## API reference

GET /api/testcases lists all test cases. POST /api/testcases creates a test case. PUT /api/testcases/{id} updates a test case. DELETE /api/testcases/{id} deletes a test case. POST /api/testcases/suggest returns a rule-based suggestion from a JSON body of the form { "description": "..." }. POST /api/testcases/ai-generate returns an LLM-generated test case from a JSON body of the form { "summary": "..." }.

## Project structure

tmsBackend is the Spring Boot API. Its main package, com.example.tms, contains TmsApplication (the entry point), controller/TestCaseController, service/TestCaseService (CRUD plus the rule-based suggestion), service/AiSuggestionService (parses and cleans the Ollama response), service/OllamaService (calls the local Ollama LLM), model/TestCase (the JPA entity), model/SuggestionResponse, dto/AiTestCaseSuggestion, and repository/TestCaseRepository. Configuration lives in src/main/resources/application.properties.

tmsFrontend is the React and Vite UI. src/App.jsx holds the form, the live AI panel, and the test case list; styling lives in App.css and index.css.

## Getting started

Prerequisites: Java 17+, Node 20+, and Ollama (https://ollama.com) installed locally if you want the full LLM-generation feature. CRUD and the rule-based /suggest endpoint work fine without it.

First, pull the model once (only needed for AI generation):

ollama pull llama3

Next, run the backend (Spring Boot, port 8080):

cd tmsBackend
./mvnw spring-boot:run

It uses an in-memory H2 database, so no setup is required. The H2 console is available at /h2-console (JDBC URL jdbc:h2:mem:tmsdb, user sa, empty password).

Finally, run the frontend (React and Vite, port 5173):

cd tmsFrontend
npm install
npm run dev

Open the printed local URL. The frontend calls the backend at http://localhost:8080.

## Notes and limitations

Data lives in an in-memory H2 database, so it resets on every backend restart; swapping in Postgres or MySQL via a Spring profile would be the natural next step for persistence. The /ai-generate endpoint depends on a local Ollama instance serving llama3, so without it only the LLM-powered suggestions fail while manual CRUD and the rule-based /suggest endpoint keep working. The rule-based /suggest endpoint is intentionally simple, a handful of keyword checks, existing as an instant, zero-dependency fallback while the LLM call is slower to resolve.
