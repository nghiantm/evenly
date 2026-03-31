import { createContext, useContext } from 'react';

interface WorkspaceActionsContextValue {
  openNewGroup:      () => void;
  openNewExpense:    () => void;
  openRecordPayment: () => void;
  currentGroupId:    string | null;
}

export const WorkspaceActionsContext = createContext<WorkspaceActionsContextValue>({
  openNewGroup:      () => {},
  openNewExpense:    () => {},
  openRecordPayment: () => {},
  currentGroupId:    null,
});

export function useWorkspaceActions() {
  return useContext(WorkspaceActionsContext);
}
