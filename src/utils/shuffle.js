import { ABNORMAL_CODES } from "../data/meta";

export function getSecureRandomInt(max) {
  if (!Number.isInteger(max) || max <= 0) {
    throw new Error("max must be a positive integer");
  }

  const array = new Uint32Array(1);
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % max);

  let randomValue;
  do {
    crypto.getRandomValues(array);
    randomValue = array[0];
  } while (randomValue >= limit);

  return randomValue % max;
}

export function shuffleArraySecure(array) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = getSecureRandomInt(i + 1);
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}

function getRandomObservationState() {
  // 上/下の表記は画面に出さない。
  // まず通常状態Aか状態異常かを50/50で決定する。
  // 状態異常の場合は D/B/O/I/U/S/C のどれかをランダム付与する。
  const isActive = getSecureRandomInt(2) === 0;
  if (isActive) return "A";
  return ABNORMAL_CODES[getSecureRandomInt(ABNORMAL_CODES.length)];
}

export function shuffleDeck(cardsData) {
  return shuffleArraySecure(cardsData).map((card) => {
    const stateCode = getRandomObservationState();
    return {
      ...card,
      stateCode,
      text: stateCode === "A" ? card.uprightText : card.abnormalText,
    };
  });
}

export function observeCards(shuffledDeck, count) {
  if (!Array.isArray(shuffledDeck) || shuffledDeck.length < count) {
    return [];
  }

  return shuffledDeck.slice(0, count);
}

export function observeNineCardsAsRows(shuffledDeck) {
  const cards = observeCards(shuffledDeck, 9);
  return [cards.slice(0, 3), cards.slice(3, 6), cards.slice(6, 9)];
}
