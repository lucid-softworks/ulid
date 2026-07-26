# `@lucid-softworks/ulid`

Canonical ULID generation, timestamp decoding, and monotonic generation with
injectable clocks and randomness.

```ts
import {
  decodeUlidTime,
  monotonicUlidFactory,
  ulid,
} from "@lucid-softworks/ulid";

const id = ulid();
const createdAt = decodeUlidTime(id);
const nextId = monotonicUlidFactory();
nextId();
```

Generated IDs are 26 uppercase Crockford Base32 characters. Custom random
sources must return values in `[0, 1)`.
