import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

const makeTasks = (overrides = []) =>
  overrides.map((o, i) => ({
    id: `todo-${i}`,
    name: `Task ${i}`,
    completed: false,
    ...o,
  }));

describe("Clear Completed button", () => {
  // --- visibility ---

  it("is hidden when no tasks are completed", () => {
    render(
      <App
        tasks={makeTasks([{ completed: false }, { completed: false }])}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /clear completed/i }),
    ).not.toBeInTheDocument();
  });

  it("appears when at least one task is completed", () => {
    render(
      <App
        tasks={makeTasks([{ completed: true }, { completed: false }])}
      />,
    );
    expect(
      screen.getByRole("button", { name: /clear completed/i }),
    ).toBeInTheDocument();
  });

  it("appears when all tasks are completed", () => {
    render(
      <App
        tasks={makeTasks([{ completed: true }, { completed: true }])}
      />,
    );
    expect(
      screen.getByRole("button", { name: /clear completed/i }),
    ).toBeInTheDocument();
  });

  // --- main behavior ---

  it("removes all completed tasks when clicked", async () => {
    const user = userEvent.setup();
    render(
      <App
        tasks={makeTasks([
          { name: "Done A", completed: true },
          { name: "Active B", completed: false },
          { name: "Done C", completed: true },
        ])}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /clear completed/i }),
    );

    // completed tasks removed
    expect(screen.queryByLabelText("Done A")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Done C")).not.toBeInTheDocument();
    // active task remains
    expect(screen.getByLabelText("Active B")).toBeInTheDocument();
  });

  it("updates the remaining-tasks heading after clearing", async () => {
    const user = userEvent.setup();
    render(
      <App
        tasks={makeTasks([
          { completed: true },
          { completed: false },
          { completed: true },
        ])}
      />,
    );

    // before: filter shows all 3
    expect(screen.getByText(/3 tasks remaining/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /clear completed/i }),
    );

    expect(screen.getByText(/1 task remaining/i)).toBeInTheDocument();
  });

  // --- edge cases ---

  it("hides itself after all completed tasks are cleared", async () => {
    const user = userEvent.setup();
    render(
      <App
        tasks={makeTasks([
          { completed: true },
          { completed: false },
        ])}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /clear completed/i }),
    );

    expect(
      screen.queryByRole("button", { name: /clear completed/i }),
    ).not.toBeInTheDocument();
  });

  it("removes all tasks when every task is completed", async () => {
    const user = userEvent.setup();
    render(
      <App
        tasks={makeTasks([
          { name: "X", completed: true },
          { name: "Y", completed: true },
        ])}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /clear completed/i }),
    );

    expect(screen.queryByText("X")).not.toBeInTheDocument();
    expect(screen.queryByText("Y")).not.toBeInTheDocument();
    expect(screen.getByText(/0 tasks remaining/i)).toBeInTheDocument();
  });

  it("is hidden when the task list is empty", () => {
    render(<App tasks={[]} />);
    expect(
      screen.queryByRole("button", { name: /clear completed/i }),
    ).not.toBeInTheDocument();
  });
});
