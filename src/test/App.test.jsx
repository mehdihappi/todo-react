import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import App from "../App";

const INITIAL_TASKS = [
  { id: "todo-0", name: "Eat", completed: true },
  { id: "todo-1", name: "Sleep", completed: false },
  { id: "todo-2", name: "Repeat", completed: false },
];

function setup(tasks = INITIAL_TASKS) {
  const user = userEvent.setup();
  render(<App tasks={tasks} />);
  return { user };
}

describe("App – initial render", () => {
  it("renders the heading and all tasks", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: /todomatic/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("shows the correct remaining-tasks count", () => {
    setup();
    // The heading counts the number of currently displayed (filtered) tasks
    expect(screen.getByText("3 tasks remaining")).toBeInTheDocument();
  });
});

describe("Create todo", () => {
  it("adds a new task when the form is submitted", async () => {
    const { user } = setup();

    const input = screen.getByRole("textbox", {
      name: /what needs to be done/i,
    });
    const addButton = screen.getByRole("button", { name: /add/i });

    await user.type(input, "Exercise");
    await user.click(addButton);

    expect(screen.getByLabelText("Exercise")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    // input is cleared after submission
    expect(input).toHaveValue("");
  });

  it("updates the remaining-tasks count after adding", async () => {
    const { user } = setup();

    const input = screen.getByRole("textbox", {
      name: /what needs to be done/i,
    });
    const addButton = screen.getByRole("button", { name: /add/i });

    await user.type(input, "Exercise");
    await user.click(addButton);

    expect(screen.getByText("4 tasks remaining")).toBeInTheDocument();
  });
});

describe("Complete todo", () => {
  it("toggles a task between complete and incomplete", async () => {
    const { user } = setup();

    // "Sleep" starts as not completed – use getByLabelText for label→checkbox
    const sleepCheckbox = screen.getByLabelText("Sleep");
    expect(sleepCheckbox).not.toBeChecked();

    await user.click(sleepCheckbox);
    expect(sleepCheckbox).toBeChecked();

    await user.click(sleepCheckbox);
    expect(sleepCheckbox).not.toBeChecked();
  });

  it("completed task is hidden by Active filter", async () => {
    const { user } = setup();

    // Complete "Sleep"
    await user.click(screen.getByLabelText("Sleep"));

    // Switch to Active filter
    await user.click(screen.getByRole("button", { name: /Active/ }));

    // Sleep and Eat are both completed, only Repeat is active
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByLabelText("Repeat")).toBeInTheDocument();
    expect(screen.queryByLabelText("Sleep")).not.toBeInTheDocument();
  });
});

describe("Edit todo", () => {
  it("renames a task via the edit form", async () => {
    const { user } = setup();

    // Click "Edit" for "Sleep"
    const editButton = screen.getByRole("button", { name: /edit sleep/i });
    await user.click(editButton);

    // The editing form appears
    const editInput = screen.getByLabelText(/new name for sleep/i);
    expect(editInput).toBeInTheDocument();

    await user.clear(editInput);
    await user.type(editInput, "Nap");

    const saveButton = screen.getByRole("button", {
      name: /save.*new name for sleep/i,
    });
    await user.click(saveButton);

    // "Sleep" is replaced by "Nap"
    expect(screen.queryByLabelText("Sleep")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nap")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("cancels editing and keeps the original name", async () => {
    const { user } = setup();

    const editButton = screen.getByRole("button", { name: /edit sleep/i });
    await user.click(editButton);

    const editInput = screen.getByLabelText(/new name for sleep/i);
    await user.clear(editInput);
    await user.type(editInput, "Nap");

    const cancelButton = screen.getByRole("button", {
      name: /cancel.*renaming sleep/i,
    });
    await user.click(cancelButton);

    // original name is preserved
    expect(screen.getByLabelText("Sleep")).toBeInTheDocument();
    expect(screen.queryByLabelText("Nap")).not.toBeInTheDocument();
  });
});

describe("Delete todo", () => {
  it("removes a task when delete is clicked", async () => {
    const { user } = setup();

    const deleteButton = screen.getByRole("button", {
      name: /delete sleep/i,
    });
    await user.click(deleteButton);

    expect(screen.queryByText("Sleep")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("2 tasks remaining")).toBeInTheDocument();
  });
});

describe("Filter todos", () => {
  it("shows all tasks by default with All filter pressed", () => {
    setup();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: /All/, pressed: true }),
    ).toBeInTheDocument();
  });

  it("filters to active (incomplete) tasks only", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: /Active/ }));

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    // "Eat" is completed, so it should not appear
    expect(screen.queryByLabelText("Eat")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Sleep")).toBeInTheDocument();
    expect(screen.getByLabelText("Repeat")).toBeInTheDocument();
  });

  it("filters to completed tasks only", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: /Completed/ }));

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(screen.getByLabelText("Eat")).toBeInTheDocument();
    expect(screen.queryByLabelText("Sleep")).not.toBeInTheDocument();
  });

  it("returns to showing all tasks", async () => {
    const { user } = setup();

    // switch to Completed, then back to All
    await user.click(screen.getByRole("button", { name: /Completed/ }));
    await user.click(screen.getByRole("button", { name: /All/ }));

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
