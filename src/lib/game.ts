import type { CardPair } from "../data/themes";

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** Keep every chosen pair; fill the remaining places without duplicate pairs. */
export function selectPairs(pool: readonly CardPair[], selectedIds: readonly string[], count: number, random: () => number = Math.random): CardPair[] {
  if (!Number.isInteger(count) || count < 1 || count > pool.length) throw new Error("카드 쌍 개수를 확인해주세요.");
  const wanted = new Set(selectedIds);
  const chosen = pool.filter((pair) => wanted.has(pair.id));
  if (chosen.length !== wanted.size) throw new Error("선택한 카드가 이 테마에 없어요.");
  if (chosen.length > count) throw new Error("선택한 카드보다 카드 쌍 수를 늘려주세요.");
  const remaining = shuffle(pool.filter((pair) => !wanted.has(pair.id)), random);
  return shuffle([...chosen, ...remaining.slice(0, count - chosen.length)], random);
}

export interface PlayingCard { id: string; pairId: string; name: string; image: string }
export function getBoardLayout(total: number) {
  const target = Math.min(10, Math.max(3, Math.round(Math.sqrt(total * 1.5))));
  const divisors = Array.from({ length: 8 }, (_, index) => index + 3).filter((columns) => total % columns === 0 && Math.abs(columns - target) <= 2).sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
  const desktopColumns = total <= 4 ? 2 : divisors[0] || target;
  const mobileColumns = total <= 4 ? 2 : total <= 12 ? (total % 3 === 0 ? 3 : 4) : total <= 40 ? 5 : 6;
  return { desktopColumns, desktopRows: Math.ceil(total / desktopColumns), mobileColumns, mobileRows: Math.ceil(total / mobileColumns) };
}
export function buildDeck(pairs: readonly CardPair[], random: () => number = Math.random): PlayingCard[] {
  if (new Set(pairs.map((pair) => pair.id)).size !== pairs.length) throw new Error("중복된 카드 쌍이 있어요.");
  return shuffle(pairs.flatMap((pair) => [
    { ...pair.left, id: pair.id + "-left", pairId: pair.id },
    { ...pair.right, id: pair.id + "-right", pairId: pair.id },
  ]), random);
}
