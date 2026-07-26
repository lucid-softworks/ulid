import { describe, expect, it } from "vitest";

import { decodeUlidTime, monotonicUlidFactory, ulid } from "../src/index.js";

describe("ULID", () => {
  it("encodes deterministic timestamps and randomness", () => {
    const value = ulid(1_700_000_000_000, () => 0);
    expect(value).toBe("01HF7YAT000000000000000000");
    expect(decodeUlidTime(value)).toBe(1_700_000_000_000);
    expect(ulid()).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/u);
  });

  it.each([-1, 1.5, 2 ** 48])("rejects time %s", (time) => {
    expect(() => ulid(time)).toThrow("48-bit");
  });

  it.each([-0.1, 1, Number.NaN])("rejects random value %s", (value) => {
    expect(() => ulid(0, () => value)).toThrow("random source");
  });

  it("generates monotonic identifiers through equal and backward clocks", () => {
    const times = [10, 10, 9, 11];
    const generate = monotonicUlidFactory(
      () => times.shift() as number,
      () => 0,
    );
    const values = [generate(), generate(), generate(), generate()];
    expect(
      values.every(
        (value, index) => index === 0 || value > (values[index - 1] as string),
      ),
    ).toBe(true);
    expect(new Set(values).size).toBe(4);
    expect(values.map(decodeUlidTime)).toEqual([10, 10, 10, 11]);
  });

  it("rejects monotonic random overflow", () => {
    const generate = monotonicUlidFactory(
      () => 0,
      () => 0.999,
    );
    generate();
    expect(() => generate()).toThrow("exhausted");
  });

  it.each(["", "8ZZZZZZZZZ0000000000000000", "01hf7yat000000000000000000"])(
    "rejects non-canonical ULID %j",
    (value) => {
      expect(() => decodeUlidTime(value)).toThrow(RangeError);
    },
  );
});
