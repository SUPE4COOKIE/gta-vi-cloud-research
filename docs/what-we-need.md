# What we need most

A wishlist, ranked by how much each item would move the project. Nothing here is a request
to buy hardware; it is a description of what would settle open questions.

## 1. A console that can start Killer Instinct 2 Classic

**What it settles:** whether the allowlist reflects real behaviour. Right now the entire
project rests on the assumption that `XBOXONE` in `allowedDeviceTypes` means an Xbox can
actually play it. Nobody here has seen it happen.

**What to report:** did the session start, did it reach gameplay, what did the console show
if it failed.

**Effort:** minutes, if you own the console and the title.

## 2. Dev-mode console or devkit with system-level tracing

**What it settles:** U1 and U2 — the backend acceptance rule and whether attestation alone is
enough.

**What to record:** whether `/device/authenticate` is visible at system level, the field
**names** present, HTTP status, and claim **categories**. Never token values.

**Why it is realistic:** developer tooling already exists for console HTTP inspection. What
is unverified is whether it sees SystemOS-level authentication rather than only title traffic.

## 3. Official Windows client, signed in as an entitled account

**What it settles:** U4 — whether the RPS device token issued by `gamingservices.exe` is
presented to XSTS and shows up in the GSSV session.

**What to record:** offering, status codes, and whether a `devicetype` claim appears (not its
value from the JWE — the class it ends up as downstream).

**Why it matters:** it is the last unobserved step on the PC side. It will not produce a
console class, but it closes the chain.

## 4. A second entitled account

**What it settles:** whether catalogue differences are account-specific. One account cannot
distinguish "service changed" from "this account changed".

**What to report:** catalogue counts and restricted entries, nothing else.

## 5. Samsung TV owner

**What it settles:** U6, and only for KI 2 Classic. GTA VI's allowlist omits `SAMSUNGTV`.

**What to report:** title start result, region, error text if any.

## 6. Public-source contributions

- Static analysis of console provider exports, with addresses and evidence labels.
- Review of open-source clients: what they send, not what they claim.
- Corrections to anything in this repository that is wrong. Corrections are first-class
  contributions here.

## What does not help

| Item | Why not |
|---|---|
| Leaked game assets | Do not touch device trust; separate problem |
| A leaked game executable | Would still need an Xbox runtime; not a cloud-auth artifact |
| More header/UA permutations | Already mapped as ineffective |
| Another `device.auth` string sweep | Same |
| Screenshots of a game card | Not a session, not gameplay |
| "It works on my PC" without a method | Unreproducible |

## How to offer an item

Open an issue with the template, state which unknown it addresses, and describe what you can
access. Do not send credentials, captures or proprietary files. If the item requires
hardware you own, say so; the project will not ask you to buy anything.
