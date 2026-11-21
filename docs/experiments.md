# Experiments

A catalogue of what was run. Dates are local. "Locally tested" means we executed it and
recorded the result; values that would be credentials are never included.

## Session and catalogue

| # | Hypothesis | Method | Result | Level |
|---|---|---|---|---|
| 1 | Restricted titles exist in the catalogue | Paginate `/v2/titles` and inspect `allowedDeviceTypes` | KI 2 Classic restricted to `XBOXONE, SCARLETT, SAMSUNGTV` | Locally tested |
| 2 | Entitlement explains the refusal | Compare KI 2013 / KI Classic 1 / KI 2 Classic rows | All entitled; only KI 2 Classic restricted | Locally tested |
| 3 | Session start fails before allocation | `POST /v5/sessions/cloud/play` on both titles | KI 2 → `400 DeviceTypeNotAllowed` in ~400 ms; KI 2013 → `202` + `sessionPath` (2026-11-19; KI 2 now returns `500`) | Locally tested |
| 4 | Client metadata can pass the gate | ~250 variations of UA, device info, client, OS, sdkType, model, region, API version | All refused | Locally tested |
| 5 | The console offering behaves differently | `xgpuconsole` login + 79 variations | Catalogue lists the title; session still refused | Locally tested |
| 6 | The PC app offering exposes the titles | `XGPUPCAPP` catalogue pull | Both restricted titles absent | Locally tested |
| 7 | Catalogue gating tracks the device token | `xgpuconsole` catalogue with a `Win32` device token | Same 2,865 titles, same 2 restricted | Locally tested |
| 8 | The web catalogue is stable | Full scan on 2026-11-19 and 2026-11-20 | Restricted titles disappeared from `xgpuweb` | Locally tested |

## Device tokens

| # | Hypothesis | Method | Result | Level |
|---|---|---|---|---|
| 9 | `device.auth` issues console classes | PoP request per device type | `Win32`/`Android`/`iOS` → 200; 20+ console types → 400 empty. **Superseded**: the console endpoint is a different shape (#12a) | Locally tested |
| 10 | The 400 is a signing bug | Verify fresh Win32 and XboxOne requests offline against the public spec | Both signatures valid | Locally tested |
| 11 | One request, one chance — `Durango` | Single fresh-key probe | `400`, empty body | Locally tested |
| 12 | Console fields unlock the console type | Signed `XboxOne`/`XboxCoreOS` request with dummy attestation fields | Still `400`, empty body — the fields were the wrong branch's | Locally tested |
| 12a | The console branch is a distinct wire shape | Five fields, `TokenType: SP_JWT`, no `Signature` header, SP-minted attestation | `200` + XCOS with real material; `400` with synthetic blobs at the same 2,963 bytes | Community measured (2026-11-21) |
| 13 | Device class reaches the session token | XSTS with `DeviceToken`, then GSSV login | `gsToken.devicetype` matches the device token | Locally tested |

## Windows surfaces

| # | Hypothesis | Method | Result | Level |
|---|---|---|---|---|
| 14 | The PC app performs device auth | App-level proxy capture (XMAT) | SISU + presence only; no `device.auth` | Locally tested |
| 15 | Windows performs device auth at all | WinHTTP proxy + logger, restart `gamingservices.exe` | `device.auth` CONNECT observed | Locally tested |
| 16 | Which process issues it | Map proxy connections to owning PID | `gamingservices.exe` | Locally tested |
| 17 | What it sends | TLS termination for the device-auth host | RPS request, no `DeviceType`, `DeviceModel` present | Locally tested |
| 18 | What it receives | Inspect the 200 response | JWE token; class not readable | Locally tested |
| 19 | Does it forward to XSTS | Host-only trace after restart | No XSTS/GSSV in that window | Locally tested |

## Client application

| # | Hypothesis | Method | Result | Level |
|---|---|---|---|---|
| 20 | The app can start cloud titles | UI Automation on product pages | Fortnite exposes `Play with Cloud, Free with ads` | Locally tested |
| 21 | KI's missing Play button is a device gate | Same app, same session, different title | KI shows Subscribe + Store; Fortnite shows Play | Locally tested |
| 22 | The app uses the same account as the API | Compare XUIDs from app SISU profile and API session token | Different accounts | Locally tested |
| 23 | The browser offers the same thing | `xbox.com/play` in Edge, UIA | Cloud action present; browser not signed in | Locally tested |

## Static analysis

| # | Hypothesis | Method | Result | Level |
|---|---|---|---|---|
| 24 | A console request builder exists in Windows | Disassemble `XblAuthManager.dll` | Builder with certificate/attestation/boot-log/SP fields | Verified |
| 25 | Its provider exists on desktop | Parse `apisetschema.dll` for the console API set | Empty host | Verified |
| 26 | The callback is unreachable | Trace registration | Registered via `QueueUserWorkItem`; correction recorded | Verified |
| 27 | A dispatch table exists | Inspect the RVA table | It is the CFG table; correction recorded | Verified |
| 28 | `SP_JWT` is produced by `XblaProcessSpToken` | Backward slice of the field operand | No data edge; correction recorded | Verified |

## Not run

- Session start for GTA VI (no entitlement; deliberately not purchased).
- Official-client GSSV trace with the entitled account (requires interactive sign-in).
- Real console or devkit capture (no hardware).
- Real Samsung TV test (no hardware).
