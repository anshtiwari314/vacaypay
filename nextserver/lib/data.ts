import type { RowDataPacket } from "mysql2";
import { displayName, randomUUID, type PublicUser } from "./auth";
import { query, withTx } from "./db";
import { HttpError, normalizeEmail } from "./http";
import { sendMail } from "./mail";

type ExpenseRow = RowDataPacket & {
  id: string;
  group_id: string | null;
  description: string;
  amount: number | string;
  paid_by_email: string;
  created_at: Date;
};

type ShareRow = RowDataPacket & {
  expense_id: string;
  email: string;
  amount: number | string;
};

export type Share = { email: string; amount: number };
export type Expense = {
  id: string;
  groupId: string | null;
  description: string;
  amount: number;
  paidByEmail: string;
  paidByName: string | null;
  createdAt: string;
  shares: Share[];
  myBalance: number;
};

export type Member = { email: string; name: string | null };
export type GroupSummary = {
  id: string;
  name: string;
  createdAt: string;
  members: Member[];
  myBalance: number;
};

function money(value: number | string) {
  return Math.round(Number(value) * 100) / 100;
}

function iso(value: Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function equalShares(amount: number, emails: string[]): Share[] {
  const cents = Math.round(amount * 100);
  const base = Math.floor(cents / emails.length);
  const extra = cents % emails.length;
  return emails.map((email, index) => ({
    email,
    amount: (base + (index < extra ? 1 : 0)) / 100,
  }));
}

function netFor(email: string, amount: number, paidByEmail: string, shares: Share[]) {
  const mine = shares.find((share) => share.email === email)?.amount ?? 0;
  const paid = paidByEmail === email ? amount : 0;
  return money(paid - mine);
}

async function namesFor(emails: string[]) {
  const unique = [...new Set(emails)];
  const map = new Map<string, string | null>();
  if (!unique.length) return map;
  const rows = await query<Array<RowDataPacket & { email: string; name: string | null }>>(
    `SELECT email, name FROM users WHERE email IN (${unique.map(() => "?").join(",")})`,
    unique,
  );
  for (const row of rows) map.set(row.email, row.name);
  return map;
}

async function loadExpenses(whereSql: string, params: unknown[], viewer: string): Promise<Expense[]> {
  const rows = await query<ExpenseRow[]>(
    `SELECT DISTINCT e.id, e.group_id, e.description, e.amount, e.paid_by_email, e.created_at
     FROM expenses e
     LEFT JOIN expense_shares s ON s.expense_id = e.id
     ${whereSql}
     ORDER BY e.created_at DESC`,
    params,
  );
  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const shareRows = await query<ShareRow[]>(
    `SELECT expense_id, email, amount FROM expense_shares WHERE expense_id IN (${ids.map(() => "?").join(",")})`,
    ids,
  );
  const sharesByExpense = new Map<string, Share[]>();
  for (const share of shareRows) {
    const list = sharesByExpense.get(share.expense_id) ?? [];
    list.push({ email: share.email, amount: money(share.amount) });
    sharesByExpense.set(share.expense_id, list);
  }
  const nameMap = await namesFor(rows.map((row) => row.paid_by_email));
  return rows.map((row) => {
    const amount = money(row.amount);
    const shares = sharesByExpense.get(row.id) ?? [];
    return {
      id: row.id,
      groupId: row.group_id,
      description: row.description,
      amount,
      paidByEmail: row.paid_by_email,
      paidByName: nameMap.get(row.paid_by_email) ?? null,
      createdAt: iso(row.created_at),
      shares,
      myBalance: netFor(viewer, amount, row.paid_by_email, shares),
    };
  });
}

async function membersFor(groupIds: string[]) {
  const map = new Map<string, Member[]>();
  if (!groupIds.length) return map;
  const rows = await query<Array<RowDataPacket & { group_id: string; email: string; name: string | null }>>(
    `SELECT gm.group_id, gm.email, u.name
     FROM group_members gm
     LEFT JOIN users u ON u.email = gm.email
     WHERE gm.group_id IN (${groupIds.map(() => "?").join(",")})
     ORDER BY gm.created_at ASC`,
    groupIds,
  );
  for (const row of rows) {
    const list = map.get(row.group_id) ?? [];
    list.push({ email: row.email, name: row.name });
    map.set(row.group_id, list);
  }
  return map;
}

export async function listGroups(email: string): Promise<GroupSummary[]> {
  const groups = await query<Array<RowDataPacket & { id: string; name: string; created_at: Date }>>(
    `SELECT g.id, g.name, g.created_at
     FROM \`groups\` g
     JOIN group_members me ON me.group_id = g.id AND me.email = ?
     ORDER BY g.created_at DESC`,
    [email],
  );
  const ids = groups.map((group) => group.id);
  const members = await membersFor(ids);
  const expenses = ids.length
    ? await loadExpenses(`WHERE e.group_id IN (${ids.map(() => "?").join(",")})`, ids, email)
    : [];
  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    createdAt: iso(group.created_at),
    members: members.get(group.id) ?? [],
    myBalance: money(expenses.filter((expense) => expense.groupId === group.id).reduce((sum, expense) => sum + expense.myBalance, 0)),
  }));
}

export async function getGroup(email: string, groupId: string) {
  const groups = await listGroups(email);
  const group = groups.find((item) => item.id === groupId);
  if (!group) throw new HttpError(404, "That group is not on your account");
  const expenses = await loadExpenses("WHERE e.group_id = ?", [groupId], email);
  return { ...group, expenses };
}

export async function createGroup(user: PublicUser, name: string, rawEmails: unknown) {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 80) throw new HttpError(400, "Give the group a name");
  const emails = uniqueEmails(rawEmails);
  if (!emails.includes(user.email)) emails.unshift(user.email);
  if (emails.length > 50) throw new HttpError(400, "A group can have up to 50 people");

  const id = randomUUID();
  await withTx(async (conn) => {
    await conn.query("INSERT INTO `groups` (id, name, created_by) VALUES (?, ?, ?)", [id, trimmed, user.id]);
    for (const memberEmail of emails) {
      const [found] = await conn.query<Array<RowDataPacket & { id: string }>>(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [memberEmail],
      );
      await conn.query("INSERT INTO group_members (id, group_id, email, user_id) VALUES (?, ?, ?, ?)", [
        randomUUID(),
        id,
        memberEmail,
        found[0]?.id ?? null,
      ]);
    }
  });

  const invites = [];
  for (const memberEmail of emails) {
    if (memberEmail === user.email) continue;
    const result = await sendMail(
      memberEmail,
      `You're in "${trimmed}" on VacayPay`,
      `${displayName(user)} added you to "${trimmed}" on VacayPay.\n\nSign in with ${memberEmail} and the group will be on your Groups tab.`,
    );
    invites.push({ email: memberEmail, ...result });
  }

  return { group: await getGroup(user.email, id), invites };
}

export async function listFriends(email: string) {
  const links = await query<Array<RowDataPacket & { user_email: string; friend_email: string }>>(
    "SELECT user_email, friend_email FROM friendships WHERE user_email = ? OR friend_email = ?",
    [email, email],
  );
  const emails = new Set<string>();
  for (const link of links) {
    const other = link.user_email === email ? link.friend_email : link.user_email;
    if (other !== email) emails.add(other);
  }

  const direct = (await loadExpenses("WHERE e.group_id IS NULL AND (e.paid_by_email = ? OR s.email = ?)", [email, email], email));
  const balances = new Map<string, number>();
  for (const expense of direct) {
    if (expense.paidByEmail === email) {
      for (const share of expense.shares) {
        if (share.email === email) continue;
        emails.add(share.email);
        balances.set(share.email, money((balances.get(share.email) ?? 0) + share.amount));
      }
    } else {
      const mine = expense.shares.find((share) => share.email === email)?.amount ?? 0;
      emails.add(expense.paidByEmail);
      balances.set(expense.paidByEmail, money((balances.get(expense.paidByEmail) ?? 0) - mine));
    }
  }

  const nameMap = await namesFor([...emails]);
  return [...emails]
    .sort((a, b) => a.localeCompare(b))
    .map((friendEmail) => ({
      email: friendEmail,
      name: nameMap.get(friendEmail) ?? null,
      balance: balances.get(friendEmail) ?? 0,
    }));
}

export async function addFriend(user: PublicUser, rawEmail: unknown) {
  const friend = normalizeEmail(rawEmail);
  if (!friend) throw new HttpError(400, "Enter a valid email");
  if (friend === user.email) throw new HttpError(400, "You can't add yourself");
  await query("INSERT IGNORE INTO friendships (id, user_email, friend_email) VALUES (?, ?, ?)", [
    randomUUID(),
    user.email,
    friend,
  ]);
  const invite = await sendMail(
    friend,
    `${displayName(user)} added you on VacayPay`,
    `${displayName(user)} added you as a friend on VacayPay. Sign in with ${friend} to split bills together.`,
  );
  const friends = await listFriends(user.email);
  return { friend: friends.find((item) => item.email === friend) ?? { email: friend, name: null, balance: 0 }, invite };
}

async function expenseFields(input: {
  user: PublicUser;
  description: string;
  amount: number;
  groupId: string | null;
  rawEmails: unknown;
  paidBy?: unknown;
}) {
  const description = input.description.trim();
  if (description.length < 1 || description.length > 140) throw new HttpError(400, "Describe the expense");
  if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount > 10_000_000) {
    throw new HttpError(400, "Enter an amount greater than zero");
  }
  const amount = money(input.amount);

  let emails = uniqueEmails(input.rawEmails);
  let allowed: Set<string> | null = null;
  if (input.groupId) {
    const members = await query<Array<RowDataPacket & { email: string }>>(
      "SELECT email FROM group_members WHERE group_id = ?",
      [input.groupId],
    );
    if (!members.some((member) => member.email === input.user.email)) {
      throw new HttpError(403, "You are not in this group");
    }
    if (!emails.length) emails = members.map((member) => member.email);
    allowed = new Set(members.map((member) => member.email));
    if (emails.some((email) => !allowed!.has(email))) {
      throw new HttpError(400, "Everyone in the split has to be in the group");
    }
  }
  if (!emails.includes(input.user.email)) emails.unshift(input.user.email);

  const paidBy = normalizeEmail(input.paidBy) ?? input.user.email;
  if (allowed && !allowed.has(paidBy)) throw new HttpError(400, "The person who paid has to be in the group");
  if (!allowed && paidBy !== input.user.email && !emails.includes(paidBy)) {
    throw new HttpError(400, "The person who paid has to be in the split");
  }
  if (!emails.includes(paidBy)) emails.push(paidBy);
  if (emails.length < 2) throw new HttpError(400, "Add at least one other person to split with");

  return { description, amount, emails, paidBy, shares: equalShares(amount, emails) };
}

async function writeShares(
  conn: { query: (sql: string, params: unknown[]) => Promise<unknown> },
  expenseId: string,
  shares: Share[],
) {
  for (const share of shares) {
    await conn.query("INSERT INTO expense_shares (id, expense_id, email, amount) VALUES (?, ?, ?, ?)", [
      randomUUID(),
      expenseId,
      share.email,
      share.amount,
    ]);
  }
}

export async function createExpense(input: {
  user: PublicUser;
  description: string;
  amount: number;
  groupId: string | null;
  rawEmails: unknown;
  paidBy?: unknown;
}) {
  const fields = await expenseFields(input);
  const id = randomUUID();
  await withTx(async (conn) => {
    await conn.query(
      "INSERT INTO expenses (id, group_id, description, amount, paid_by_email) VALUES (?, ?, ?, ?, ?)",
      [id, input.groupId, fields.description, fields.amount, fields.paidBy],
    );
    await writeShares(conn, id, fields.shares);
  });

  const loaded = await loadExpenses("WHERE e.id = ?", [id], input.user.email);
  return loaded[0];
}

export async function getExpense(email: string, expenseId: string) {
  const rows = await loadExpenses(
    "WHERE e.id = ? AND (e.paid_by_email = ? OR s.email = ?)",
    [expenseId, email, email],
    email,
  );
  if (!rows[0]) throw new HttpError(404, "That expense is not on your account");
  return rows[0];
}

export async function updateExpense(input: {
  user: PublicUser;
  expenseId: string;
  description: string;
  amount: number;
  rawEmails: unknown;
  paidBy?: unknown;
}) {
  const existing = await getExpense(input.user.email, input.expenseId);
  const fields = await expenseFields({ ...input, groupId: existing.groupId });
  await withTx(async (conn) => {
    await conn.query("UPDATE expenses SET description = ?, amount = ?, paid_by_email = ? WHERE id = ?", [
      fields.description,
      fields.amount,
      fields.paidBy,
      input.expenseId,
    ]);
    await conn.query("DELETE FROM expense_shares WHERE expense_id = ?", [input.expenseId]);
    await writeShares(conn, input.expenseId, fields.shares);
  });
  return getExpense(input.user.email, input.expenseId);
}

function uniqueEmails(value: unknown) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,\n]+/) : [];
  const emails: string[] = [];
  for (const item of source) {
    if (typeof item !== "string" || !item.trim()) continue;
    const email = normalizeEmail(item);
    if (!email) throw new HttpError(400, `"${item.trim()}" is not an email`);
    if (!emails.includes(email)) emails.push(email);
  }
  return emails;
}
