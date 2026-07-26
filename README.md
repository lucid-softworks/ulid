# `@lucid-softworks/ulid`

Canonical ULID generation, timestamp decoding, and monotonic generation with
injectable clocks and randomness.

```ts
const id = ulid();
const createdAt = decodeUlidTime(id);
const nextId = monotonicUlidFactory();
```

Generated IDs are 26 uppercase Crockford Base32 characters. Custom random
sources must return values in `[0, 1)`.
