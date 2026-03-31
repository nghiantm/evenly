// ─── Users ───────────────────────────────────────────────────────────────────

export interface User {
  userId: string;
  externalSubject: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  status: string;
  defaultCurrency: string;
  avatarUrl: string | null;
}

export interface UserSearchResult {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface UpdateUserRequest {
  displayName?: string;
  defaultCurrency?: string;
  avatarUrl?: string | null;
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export type GroupRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Group {
  groupId: string;
  name: string;
  defaultCurrency: string;
  simplifyDebts: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  memberCount: number;
  myRole: GroupRole;
}

export interface GroupMember {
  userId: string;
  email: string;
  displayName: string;
  role: GroupRole;
  joinedAt: string;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
  recentExpenseCount: number;
  recentSettlementCount: number;
}

export interface CreateGroupRequest {
  name: string;
  defaultCurrency: string;
}

export interface UpdateGroupRequest {
  name?: string;
  defaultCurrency?: string;
  simplifyDebts?: boolean;
}

export interface AddMemberRequest {
  userId: string;
  role: GroupRole;
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENT' | 'SHARE';

export interface ExpensePayment {
  userId: string;
  amount: number;
}

export interface ExpenseSplit {
  userId: string;
  amountOwed: number;
  splitType: SplitType;
  shares: number | null;
  percentage: number | null;
}

export interface Expense {
  expenseId: string;
  groupId: string;
  description: string;
  currency: string;
  totalAmount: number;
  expenseDate: string;
  note: string | null;
  createdBy: string;
  paidBy: ExpensePayment[];
  splits: ExpenseSplit[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpensesPage {
  expenses: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Assumption: for PERCENT/SHARE split types the frontend calculates amountOwed
// before submission since the spec only shows amountOwed in request bodies.
export interface CreateExpenseRequest {
  description: string;
  currency: string;
  totalAmount: number;
  expenseDate: string;
  note?: string;
  paidBy: ExpensePayment[];
  splits: Array<{
    userId: string;
    amountOwed: number;
    splitType: SplitType;
  }>;
}

export type UpdateExpenseRequest = Partial<CreateExpenseRequest>;

// ─── Balances ─────────────────────────────────────────────────────────────────

export interface UserBalance {
  userId: string;
  displayName: string;
  netAmount: number;
}

export interface PairwiseDebt {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
}

export interface GroupBalances {
  groupId: string;
  currency: string;
  userBalances: UserBalance[];
  pairwiseDebts: PairwiseDebt[];
}

export interface NetByGroup {
  groupId: string;
  groupName: string;
  currency: string;
  netAmount: number;
}

export interface NetByUser {
  userId: string;
  displayName: string;
  currency: string;
  netAmount: number;
}

export interface DashboardBalance {
  youOwe: number;
  youAreOwed: number;
  netByGroup: NetByGroup[];
  netByUser: NetByUser[];
}

// ─── Settlements ──────────────────────────────────────────────────────────────

export interface Settlement {
  settlementId: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  currency: string;
  amount: number;
  settlementDate: string;
  note: string | null;
  createdBy: string;
  createdAt: string;
}

export interface SettlementsResponse {
  settlements: Settlement[];
  total: number;
}

export interface CreateSettlementRequest {
  fromUserId: string;
  toUserId: string;
  currency: string;
  amount: number;
  settlementDate: string;
  note?: string;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>;
}
