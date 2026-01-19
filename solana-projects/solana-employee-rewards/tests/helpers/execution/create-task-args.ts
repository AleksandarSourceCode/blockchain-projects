import { CreateTaskArgs } from "../../types/task";
import { Task } from "../../types/task";

export function createTaskArgs(task: Task): CreateTaskArgs {
  return {
    taskId: task.id,
    description: task.description,
    specUrl: task.specUrl,
    points: task.points,
  };
}
