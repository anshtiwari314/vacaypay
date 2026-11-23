export function formatMoney(amount: number) {
  const abs = Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₹${abs}`;
}

export function balanceLabel(amount: number) {
  if (Math.abs(amount) < 0.005) return "Settled up";
  if (amount > 0) return `owed to you ${formatMoney(amount)}`;
  return `you owe ${formatMoney(amount)}`;
}

export function personName(person: { name: string | null; email: string }) {
  return person.name?.trim() || person.email.split("@")[0];
}
