# Server-hole matrix

Every idea for slipping past the device check without console keys, what was tested, and what
is left. No tokens or account identifiers appear here.

## Tested and closed

| # | Idea | Result |
|---|---|---|
| 1 | Client headers / user agent / device info | ~250 variants, all refused |
| 2 | Console `DeviceType` strings (20+) | `400` empty |
| 3 | `x-xbl-contract-version: 1` instead of `2` | `400` empty (2026-11-20) |
| 4 | Adding `SerialNumber` to the console request | `400` empty |
| 5 | `Attestation` / `Certificate` as objects instead of strings | `400` empty |
| 6 | Filler attestation fields of realistic length | `400` empty |
| 7 | Random RPS ticket padded to 2271 chars | `400` / rejected (community) |
| 8 | Legacy API paths, old Android clients, non-prod hosts | no session (community) |
| 9 | Samsung TV flow with Xbox headers | no session (community) |
| 10 | Offering substitution (`xgpuconsole` from PC) | catalogue accepted, session still refused |
| 11 | Catalogue entry injection into the PC app | UI renders, cloud still absent |
| 12 | Device-family query swap on store endpoints | no change |
| 13 | PC-app RPS path with console model string | device class stays PC |
| 14 | Editing the signed session token | signature invalid |
| 15 | Reading the Windows device token | JWE, no recipient key |
| 16 | Emulating SystemOS/PSP without keys | no keyslot, no identity |

## Tested today (2026-11-20)

| # | Idea | Result |
|---|---|---|
| 17 | User token only (no device token) → KI 2 session | `500 InternalError` |
| 18 | Android device token → KI 2 session | `500 InternalError` |
| 19 | Win32 device token → KI 2 session (control) | `500 InternalError` |
| 20 | Same three against the console offering | `500 InternalError` |
| 21 | Same shape for unrestricted KI 2013 | `500 InternalError` |

**Important:** the `500` is not a device decision. It also hits a title that used to return
`202`, so the request shape or endpoint has drifted since 2026-11-19. No conclusion can be
drawn from these until the current session request is re-derived from a working client.
Recorded as **instrument failure**, not a finding.

## Still open — untested

| # | Idea | Needs | Why it might work |
|---|---|---|---|
| A | Borrow a console device token, replay from PC | dev-mode capture | if the token is bearer, not channel-bound |
| B | Borrow a console `gsToken` / XSTS token | capture | highest layer, least likely to be bound |
| C | Replay a captured `/device/authenticate` unchanged | capture | tests freshness and nonce binding |
| D | Swap certificates between two consoles | two consoles | tests whether the cert is bound to the device record |
| E | Clock skew / nonce reuse on a captured request | capture | servers often allow small windows |
| F | Glitched console key extraction, sign locally | hardware mod | removes the console from the loop |
| G | Devkit identity | a devkit | devkits may hold a console-class cert |
| H | Use a captured console token with a **different account** | capture + second account | tests whether the token is user-bound |
| ~~I~~ | ~~Reuse a console `sessionPath` from a PC~~ | — | **closed**: a console owner reports the session cannot be reconnected even on the same console after leaving the app (2026-11-20) |
| ~~J~~ | ~~Attach to a console-started WebRTC session~~ | — | **closed** by the same report: the session dies with the live connection |
| K | `xgpuwebf2p` (free-to-play) offering | none | different entitlement path, untested |
| L | Audience / token-type confusion (`JWT` vs `JWE`, relying party swap) | none | classic auth confusion bug |
| M | Certificate-chain leniency (expired/self-signed chain) | none | would show weak verification |
| N | Session request re-derivation against the current client | none | required before any session test is valid again |

## Order of work (revised)

1. N first — the session endpoint returns `500` for our old shape, so tests 17–21 are invalid.
2. K and L are cheap and need no hardware.
3. A/B/C need one dev-mode capture; they are the only ones that can produce a real result.
4. D/E/H/I/J need captures or a second console.
5. F/G need hardware and are not requested.

## Known dead ends, for the record

- Any client-advertised identity string.
- Any request field that is not covered by a signature.
- Any OS-level emulation without the security processor.
- Any hard-drive or update dump without retail keys.

## Order of work

1. Re-derive the current session request (so 17–21 can be retested properly).
2. Get one dev-mode capture: does `device.auth` appear at all?
3. If yes, run A/B/C.
4. If those fail, only F remains.
