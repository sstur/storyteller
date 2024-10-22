let count = 0;

export function generateId(now = Date.now()) {
  const datePart = now.toString();
  const randomPart = Math.floor(Math.random() * 10 ** 6)
    .toString()
    .padStart(6, '0');
  count = (count + 1) % 100;
  const serialPart = count.toString().padStart(2, '0');
  return datePart + randomPart + serialPart;
}
