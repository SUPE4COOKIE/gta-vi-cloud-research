# Roadmap

What this project needs is evidence, not more ideas. The full unknown map, evidence table and
per-route breakdown live in [docs/roadmap.md](docs/roadmap.md); the ranked wishlist is
[docs/what-we-need.md](docs/what-we-need.md).

## Status

| Track | State |
|---|---|
| Research understanding | ~47% (subjective) |
| Console impersonation | 0% |
| GTA VI on PC via cloud | Not achieved |

## The short version

- The gate is a console identity minted by the security processor, then accepted by XSTS for
  RETAIL. A Dev Mode console can mint one; RETAIL still rejects it with `0x8015DC19`.
- A PC cannot produce that identity. No request shape, header or client string has moved it.
- The routes left are a retail-mode console token or a glitched fat Xbox One, and neither has
  been demonstrated end to end.

## Top three asks

1. **A retail-mode console trace of sign-in and session start.** Dev Mode gave us the request
   shape; the missing half is a token minted in the retail sandbox.
2. **A console starting KI 2 Classic**, as an independent control for the allowlist.
3. **Catalogue scans over time and across accounts**, to separate account quirks from service
   behaviour.

## Not on the roadmap

Game assets, leaked executables, another header sweep, and hardware bought only to re-test a
mapped gate. See [docs/game-executables.md](docs/game-executables.md).

## Done means

An entitled account, an accepted session for a device-restricted title, a real stream reaching
gameplay, and a method that does not borrow anyone's identity —
[docs/current-status.md](docs/current-status.md#completion-criteria).
