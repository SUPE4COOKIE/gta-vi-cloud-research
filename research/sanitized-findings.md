# Sanitized findings log

Chronological record of what was established, with evidence labels. Thematic explanations
live in `/docs`; this page is the audit trail.

> Nothing here contains tokens, tickets, certificates, keys, cookies, account identifiers or
> personal data. Request and response *shapes* are published; values are not.

## 2026-11-18 — catalogue and allowlists

- **Locally tested.** A 2,400-title scan found exactly one entry with a non-empty
  `allowedDeviceTypes`: `KILLERINSTINCT2CLASSIC` → `XBOXONE, SCARLETT, SAMSUNGTV`.
- **Locally tested.** KI 2013, KI Classic 1 and KI 2 Classic had identical entitlement shape
  (`hasEntitlement: true`, same programs, same max session length). The allowlist was the
  only difference.
- **Locally tested.** Session start: KI 2013 → `202` + `sessionPath`; KI 2 Classic → `400`
  `DeviceTypeNotAllowed` in ~400 ms, before allocation.

## 2026-11-18 — client spoofing sweep

- **Locally tested.** ~250 combinations of headers, device info, client id, OS name, SDK
  type, model strings, regions and API versions did not start the restricted title.
- **Locally tested.** The `xgpuconsole` offering (79 variations) also refused.
- **Ruled out.** Client-advertised metadata is not the lever for the device decision.

## 2026-11-18 — device tokens

- **Locally tested.** `device.auth` returns `200` for `Win32`, `Android`, `iOS`; `400` with an
  empty body for console classes and 20+ alternatives.
- **Locally tested.** Fresh `Win32` and `XboxOne` PoP requests were verified offline against
  the public signing specification: valid ECDSA P-256, correct wire format. The `400` is not
  a signature-format `401`.
- **Locally tested.** XSTS with a device token puts `devicetype` into the GSSV `gsToken`.
- **Inferred.** GSSV compares that class against `allowedDeviceTypes`. The comparison itself
  was not observed.

## 2026-11-18/19 — offerings

- **Locally tested.** `XGPUPCAPP` (official Windows app) catalogue excludes both restricted
  titles; `xgpuweb` and `xgpuconsole` listed them at that time.
- **Locally tested.** `xhome` is unavailable on an account with no linked console.

## 2026-11-19 — static analysis of the Windows client

- **Verified.** `XblAuthManager.dll` contains a console request builder serialising
  `Attestation`, `Certificate`, `BootLog`/`PcrAttestation`, `DeviceType`, `SP_JWT`,
  `EffectiveRegion`.
- **Verified.** Producer getters fill the same object the builder serialises.
- **Verified.** The console-only API set (`ext-ms-win-xblauth-console-l1-1-0`) maps to an
  **empty host** in the desktop API-set schema; 44 functions have no implementation.
- **Verified.** `XblaProcessSpToken` consumes the response token; the outbound `SP_JWT` is
  an empty placeholder on the examined path.
- **Verified.** The nonce/challenge subsystem does not feed the device-auth JSON in this
  binary.

## 2026-11-19 — official Windows service path

- **Locally tested.** `gamingservices.exe` (SYSTEM) issues `POST /device/authenticate` over
  WinHTTP — invisible to application proxies.
- **Locally tested.** The request is RPS-shaped: `RpsTicket`, `SiteName`, `Version`,
  `DeviceModel`, `ProofKey`, **no `DeviceType`**.
- **Locally tested.** The response is `200` with a JWE token; the device class is not
  readable client-side.
- **Correction.** The earlier statement "the PC never performs device authentication" was
  wrong in scope: the app does not, the system service does.

## 2026-11-19/20 — client application

- **Locally tested.** The app launches with AUMID
  `Microsoft.GamingApp_8wekyb3d8bbwe!Microsoft.Xbox.App`; UIA exposes navigation, search and
  product pages.
- **Locally tested.** Fortnite exposes `Play with Cloud, Free with ads`; KI 2013 exposes
  `Subscribe` + `Show in store` only.
- **Locally tested.** The app's signed-in account differs from the API account (XUIDs
  compared; values withheld). The missing Play button is an account/entitlement mismatch,
  not a device result.
- **Locally tested.** Edge at `xbox.com/play` was not signed in; the surfaces were not
  comparable.

## 2026-11-20 — console fields and catalogue drift

- **Locally tested.** `XboxOne` and `XboxCoreOS` requests with filler attestation fields
  still return `400` empty.
- **Locally tested.** `xgpuweb` stopped listing both restricted titles (2,863 titles, zero
  allowlists); `xgpuconsole` still lists them (2,865 titles, two allowlists).
- **Locally tested.** A `Win32` device token does not change the `xgpuconsole` catalogue —
  same titles, same allowlists. Catalogue gating is per offering.

## Community reported (not reproduced here)

- A GTA VI owner with no subscription reports `hasEntitlement: true`,
  `userPrograms ["FERDINAND"]`, `maxSessionLengthInSeconds: 1800`, and
  `DeviceTypeNotAllowed` despite an `XGPUCONSOLE` login on PC.
- Public documentation describes `FERDINAND` as the ad-supported owned-games tier.
- Community projects (DeepPlay/GR33N, Bannerlator, GTAXC) have not demonstrated an accepted
  restricted session.
