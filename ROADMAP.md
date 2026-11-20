# Roadmap

What this project needs is evidence, not more ideas. This page lists the unknowns and the
artifacts that would settle them. Full detail: [docs/roadmap.md](docs/roadmap.md) ·
Ranked wishlist: [docs/what-we-need.md](docs/what-we-need.md).

## Status

| Track | State |
|---|---|
| Research understanding | ~47% (subjective) |
| Working console impersonation | 0% |
| GTA VI on PC via cloud | Not achieved |

## Unknowns

| ID | Question | Blocked by |
|---|---|---|
| U1 | What does the backend actually validate for a console identity? | Console observation |
| U2 | Is a genuine attestation sufficient by itself? | Console observation |
| U3 | Must a console record also be registered to the account? | Console file access |
| U4 | Where does the Windows RPS device token go downstream? | Interactive sign-in |
| U5 | Is catalogue filtering per account, per offering or global? | Time and a second account |
| U6 | Can a real Samsung TV start KI 2 Classic? | TV hardware |

## Highest-value evidence, in order

1. **A console starting Killer Instinct 2 Classic** — validates the premise behind the whole
   project. Minutes of work for anyone who owns the console and the title.
2. **Dev-mode or devkit system-level trace** — whether `/device/authenticate` is visible, what
   field names it carries, what status and claim categories come back.
3. **Official Windows client signed in as an entitled account** — closes the PC-side chain.
4. **Samsung TV run** — KI 2 Classic only; GTA VI does not allow `SAMSUNGTV`.
5. **Catalogue scans over time and across accounts** — cheap, answers U5.

## What each access route can and cannot do

| Access | Gives | Does not give |
|---|---|---|
| Retail console in normal use | Whether a title starts | Traffic internals |
| Retail console behind a proxy | Hosts and timing | Decrypted device-auth bodies |
| Dev mode | App-level HTTP, some system logs | Guaranteed SystemOS auth visibility |
| Devkit | Deeper tracing | Trust from the server |
| Exploited console | Potentially SystemOS files and logs | Guaranteed keys or certificates |
| Samsung TV | KI 2 Classic result | Anything for GTA VI |

A console is a **measurement instrument**, not a source of reusable credentials. Captures are
metadata-only by project policy.

## Not on the roadmap

- Game assets and leaked executables — they do not touch device trust.
  See [docs/game-executables.md](docs/game-executables.md).
- Another header or device-string sweep.
- Buying hardware solely to re-test a mapped gate.

## Done means

An entitled account, an accepted session for a device-restricted title, a real stream reaching
gameplay, and a method that does not borrow anyone's identity —
[docs/current-status.md](docs/current-status.md#completion-criteria).
