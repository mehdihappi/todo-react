# Testing the Todo React App

## Test Stack
- **Vitest** as the test runner (configured in `vite.config.js` under `test` block)
- **React Testing Library** (`@testing-library/react`) for rendering and querying
- **@testing-library/user-event** for simulating user interactions
- **@testing-library/jest-dom** for DOM matchers (loaded via `src/test/setup.js`)
- **jsdom** as the DOM environment

## Running Tests
```bash
yarn test        # single run
yarn test:watch  # watch mode
```

## Running the App Locally
```bash
yarn dev         # starts Vite dev server on port 3000
```
The app is served at `http://localhost:3000/todo-react/` (note the `/todo-react/` base path).

## Test File Location
Tests live in `src/test/App.test.jsx`. The setup file is `src/test/setup.js`.

## Key Testing Patterns & Gotchas

### Accessible Name Quirks in jsdom
- **Checkboxes**: `getByRole("checkbox", { name: ... })` may not resolve label associations correctly in jsdom. Use `getByLabelText("TaskName")` instead.
- **Visually-hidden spans**: Task names appear in labels AND in visually-hidden spans inside Edit/Delete buttons. Using `getByText("TaskName")` will throw "multiple elements found". Use `getByLabelText` / `queryByLabelText` for task existence checks.
- **Button names with visually-hidden text**: When button text is on a separate line from a `<span class="visually-hidden">` child, jsdom may drop the space between them (e.g., `"Cancelrenaming Sleep"` instead of `"Cancel renaming Sleep"`). Use `.*` in regex matchers to bridge this: `/cancel.*renaming sleep/i`.
- **Filter buttons**: Same issue — accessible names are `"ShowAlltasks"`, `"ShowActivetasks"`, `"ShowCompletedtasks"` (no spaces). Match with `/All/`, `/Active/`, `/Completed/`.

### Cleanup Between Tests
Explicit `afterEach(cleanup)` is required in the setup file. Auto-cleanup does not work with Vitest v4 + @testing-library/react v16. Without it, DOM accumulates between tests causing "multiple elements found" errors.

### Remaining Count Semantics
The heading counts **filtered (displayed) tasks**, not uncompleted tasks. With "All" filter selected, all tasks count toward the total regardless of completion status.

## Manual Browser Testing Checklist
1. **Create**: Type a name in the input, click "Add" — new task appears in the list
2. **Complete**: Click a task's checkbox — it toggles checked/unchecked
3. **Edit**: Click "Edit" on a task → type new name → click "Save" — task name updates
4. **Delete**: Click "Delete" on a task — it is removed from the list
5. **Filter**: Click "Active" — only incomplete tasks shown; click "Completed" — only completed; click "All" — all tasks
