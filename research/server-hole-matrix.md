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

## Region sweep (2026-11-20)

Four region cores tested directly (`uks`, `weu`, `eus`, `scus`):

| Offering | Result for KI 2 Classic |
|---|---|
| `xgpuweb` | `400 OfferingDoesNotContainTitle` in every region |
| `xgpuconsole` | `500 InternalError` in every region |

The web offering has dropped the title globally, not per region. The console offering still
lists it, but session start errors for a non-console client in every region.

## Session endpoint re-derivation (2026-11-20, item N)

| Variant | Result |
|---|---|
| KI 2013, v5, full body | **202** + `sessionPath` (control works) |
| KI 2013, v6 | 404 |
| KI 2013, v5, settings removed | 400 `InvalidRequestParameter` (Settings required) |
| KI 2013, v5 + `X-MS-Device-Info` | 202 |
| KI 2 Classic, v5, full body, any token | **500 InternalError** |
| KI 2 Classic, console offering, same | 500 InternalError |
| `xgpuwebf2p` login | 403 `OfferingAccessDenied` |

**Interpretation:** the request shape is valid (202 control). KI 2 Classic now returns a server
error on session start, on both offerings. A nonsense title returns a clean
`400 OfferingDoesNotContainTitle`, so the 500 is **not** a membership error: the title is present,
the server reaches it, and errors instead of returning a denial. The old
`400 DeviceTypeNotAllowed` is no longer reproducible.

Additional observations:

- requesting session start on the offering host directly returns
  `400 Unexpected host format or region ...` — the region base URI must be used
- the control title returned the **same** `sessionPath` across two calls, so a live session is
  reused for the same account rather than recreated

**Consequence:** the device gate cannot be measured for KI 2 Classic from a PC anymore. Future
session-level tests need either a GTA VI entitlement or a console-side capture.

## Tested today (2026-11-20)

| # | Idea | Result |
|---|---|---|
| 17 | User token only (no device token) → KI 2 session | `500 InternalError` |
| 18 | Android device token → KI 2 session | `500 InternalError` |
| 19 | Win32 device token → KI 2 session (control) | `500 InternalError` |
| 20 | Same three against the console offering | `500 InternalError` |
| 21 | Same shape for unrestricted KI 2013 | `500 InternalError` → later `202` after re-derivation |
| 22 | Console client header + console-style settings (`XboxOne`, `native`) | `400 OfferingDoesNotContainTitle` |
| 23 | `XboxSeriesX` header + `xboxOS` settings | `400 OfferingDoesNotContainTitle` |

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
| ~~K~~ | ~~`xgpuwebf2p` offering~~ | — | **closed**: 403 `OfferingAccessDenied` for this account |
| ~~L~~ | ~~Audience / token-type confusion~~ | — | **closed**: `TokenType: JWE` and `RelyingParty: gssv` both return `400` empty with `XboxOne` |
| ~~M~~ | ~~Certificate-chain leniency~~ | — | **blocked by the parameter gate**: any `Certificate` value returns `400` before chain validation, so leniency cannot be reached |
| ~~N~~ | ~~Session request re-derivation~~ | — | **done**: 202 control, KI 2 now returns 500 regardless of token |

## Evidence that borrowing could work

- `XboxAuthTool` mints tokens for other relying parties from a console's device token, i.e. the
  token is used off the device that created it.
- `ToastMyConsole` (patched 2019) exfiltrated XSTS user and device tokens from consoles; that
  only makes sense if the tokens are bearer credentials.

Neither proves GSSV accepts a console token from a PC. Protocol A in
[capture-protocols.md](capture-protocols.md) settles it.

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
