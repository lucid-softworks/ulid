const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const maximumTime = 2 ** 48 - 1;

export type RandomSource = () => number;

/** Creates a canonical 26-character ULID. */
export function ulid(
  time: number = Date.now(),
  random: RandomSource = Math.random,
): string {
  return encodeTime(time) + encodeRandom(random);
}

/** Returns a ULID generator that remains monotonic within one millisecond. */
export function monotonicUlidFactory(
  now: () => number = Date.now,
  random: RandomSource = Math.random,
): () => string {
  let lastTime = -1;
  let digits: number[] = [];
  return (): string => {
    const observed = now();
    validateTime(observed);
    const time = Math.max(observed, lastTime);
    if (time > lastTime) {
      digits = randomDigits(random);
      lastTime = time;
    } else {
      increment(digits);
    }
    return encodeTime(time) + digits.map((digit) => alphabet[digit]).join("");
  };
}

/** Extracts the millisecond timestamp from a canonical ULID. */
export function decodeUlidTime(value: string): number {
  if (!/^[0-9A-HJKMNP-TV-Z]{26}$/u.test(value) || (value[0] as string) > "7") {
    throw new RangeError("value must be a canonical ULID");
  }
  let time = 0n;
  for (const character of value.slice(0, 10)) {
    time = time * 32n + BigInt(alphabet.indexOf(character));
  }
  return Number(time);
}

function encodeTime(time: number): string {
  validateTime(time);
  let remaining = BigInt(time);
  let output = "";
  for (let index = 0; index < 10; index += 1) {
    output = alphabet[Number(remaining % 32n)] + output;
    remaining /= 32n;
  }
  return output;
}

function encodeRandom(random: RandomSource): string {
  return randomDigits(random)
    .map((digit) => alphabet[digit])
    .join("");
}

function randomDigits(random: RandomSource): number[] {
  return Array.from({ length: 16 }, () => {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError("random source must return values from 0 up to 1");
    }
    return Math.floor(value * 32);
  });
}

function increment(digits: number[]): void {
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    if ((digits[index] as number) < 31) {
      digits[index] = (digits[index] as number) + 1;
      return;
    }
    digits[index] = 0;
  }
  throw new RangeError("monotonic ULID random space exhausted");
}

function validateTime(time: number): void {
  if (!Number.isSafeInteger(time) || time < 0 || time > maximumTime) {
    throw new RangeError("time must be a non-negative 48-bit integer");
  }
}
