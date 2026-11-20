# Research overview

## The question

Xbox Cloud Gaming executes games on Microsoft's servers and streams the result. Most
titles are available on any supported device. A small number are restricted to specific
**device classes**, expressed as an allowlist on the title.

If a PC could present an accepted console identity, a restricted title such as GTA VI could
be streamed from a Mac or PC without owning an Xbox.

This project asks whether that is achievable, and documents the evidence either way.

## What this is not

- **Not game emulation.** No Xbox executable runs locally; the game runs on Microsoft's
  hardware.
- **Not a cheat or piracy project.** No DRM circumvention, no content extraction, no
  sharing of accounts or entitlements.
- **Not a "spoofing tutorial".** Client metadata changes were tested and did not work; they
  are documented as a negative result.

## Why Killer Instinct 2 Classic

The account used for testing is entitled to KI 2 Classic, and the title carries a device
allowlist. That makes it a controlled stand-in for GTA VI without buying GTA VI:

| | KI 2 Classic | GTA VI |
|---|---|---|
| Title ID | `KILLERINSTINCT2CLASSIC` | `GRANDTHEFTAUTOVI` |
| Product ID | `C2HDBXXNXT7R` | `9NL3WWNZLZZN` |
| Allowlist (tested snapshot) | `XBOXONE, SCARLETT, SAMSUNGTV` | `XBOXONE, SCARLETT` |
| Entitlement on test account | yes | no |
| Session attempted | yes — refused | no |

KI 2 Classic also admits `SAMSUNGTV`, which makes it relevant to a separate branch (TV
identity) that cannot help GTA VI.

## Scope

In scope:

- Xbox Live device authentication and token chains
- device-class enforcement at catalogue and session layers
- console attestation requirements as visible in public binaries
- Windows service behaviour around device authentication
- public clients, emulators and research projects, reviewed for evidence

Out of scope:

- acquiring consoles, devkits or TVs
- account or entitlement changes
- attacking Microsoft infrastructure
- anything that extracts or shares credentials

## Method

1. Observe the system from a legitimate client — catalogue pulls, session starts, token claims.
2. Change one variable at a time and record the response shape.
3. When the client surface is exhausted, read the binary that builds the request.
4. When the binary references code that does not exist on the platform, prove that boundary
   (API-set host mapping).
5. Review public projects for claims that can be checked rather than repeated.

Results are labelled per [methodology.md](methodology.md).
