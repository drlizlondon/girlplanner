export const EMPTY_LIST_MESSAGE = "Nothing here yet. Type your first task above and tap Add.";

export function showEmptyListMessage(taskCount: number): boolean {
  return taskCount === 0;
}
