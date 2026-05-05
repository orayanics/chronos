import type { Task } from "@/app/types/tpomodoro";

interface TasksProps {
  tasks: Task[];
}

export default function Tasks({ tasks }: TasksProps) {
  if (tasks.length === 0) {
    return <p className="text-sm text-primary/60">No tasks in this session.</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="rounded-xl border border-primary/10 px-3 py-2 text-sm"
        >
          <span>{task.text}</span>
          <span className="ml-2 text-primary/60">
            {task.completed ? "Completed" : "Pending"}
          </span>
        </li>
      ))}
    </ul>
  );
}
