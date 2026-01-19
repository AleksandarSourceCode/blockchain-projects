import { Task } from "../../types/task";

let nextTaskId = 1000;

export function getNewTaskId(): number {
  return nextTaskId++;
}

export function withNewTaskId(task: Task): Task {
  return {
    ...task,
    id: getNewTaskId(),
  };
}
