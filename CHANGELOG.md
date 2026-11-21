# Changelog

All notable changes to this repository. Dates are local to the investigation.

## Unreleased

### Fixed
- Major correction: the session `500` was a missing `X-MS-Device-Info` header on our side, not a
  title fault or an endpoint change. With the header, KI 2 returns `400 DeviceTypeNotAllowed` and
  KI 2013 returns `202`. The earlier "endpoint drift" entries are withdrawn.
- Dev Mode can install a trusted CA and intercept console TLS; it cannot mint console tokens
  (`XblaProcessChallenge` = E_NOTIMPL, `XblaSignDigest` is a shim, not a local signer).
- Removed a duplicated set of changelog entries.

### Fixed
- **`device.auth` has two branches.** The console branch is five fields
  (`Attestation`, `BootLog`, `Certificate`, `DeviceType`, `EffectiveRegion`), `TokenType: SP_JWT`,
  no `Signature` header, and returns `200` with an **XCOS** token. Adding any desktop field turns
  the same request into `400`. Superseded the "console classes are refused" claim in the README,
  experiments and failed-approaches docs.
- The shared `403` script is shape-dependent, not class-dependent: it returns `403` for `Scarlett`
  and `XboxOne` alike, and double-encodes base64 blob files.
- Qualified the console type-string control: `Banana` returns the same empty `400` as `XboxOne`,
  so the 425/426 pair rules out a schema problem but cannot separate class from invalid type.
  Added the `TokenType` pairing check.

### Added
- Dev Mode retail-app launch measured twice: `0x80040904` for the xCloud app. Closed the
  "capture the play call in Dev Mode" idea.

### Added
- Console-side full-TLS capture: a one-field control (`Win32` 200 vs `Xbox` 400 empty, 425/426 B)
  confirms the class gate is not a schema problem, and a real-attestation `Scarlett` request
  returns a console-class JWE. Corrected the over-broad claim that console types are refused at
  the issuer.
- New wall recorded: the Dev Mode token is rejected by `xsts/authorize` for RETAIL with
  `0x8015DC19`. Added Q10 covering sandbox binding, device record and freshness.

### Added
- Primary source reviewed: the RetroGaming PS3 stream of 2026-11-19. Real cloud gameplay
  (~2.5 h, 29–31 fps, wired), stock DeepPlay/GR33N apps, purchased game, **no device spoofing**
  described. He now says it is blocked. The "device identifiers from his own consoles" claim is
  not in the stream and remains second-hand.
- PS3 client session row in the server-hole matrix; launch-window question rewritten around the
  login/session requests rather than our own instrument error.
- Timestamp review of that stream: XMB reports "Quit Game (DeepPlay)", overlay is decoder
  telemetry, and the recording starts mid-session so auth calls are absent.
- `SP_JWT` structural variants (our-key JWS, random signature, `alg:none`) all return `400`.

### Changed
- Roadmap corrected: console capture requires a **devkit** for the token path, not retail dev
  mode, because the console client delegates device auth to the OS service.

### Added
- Examined NAND, devkit VHD, xsec source and GDK: none contains a readable console
  certificate or the Live device-auth implementation. DevAuth v2 is accessory auth.
- JWT forgery tests: `alg:none` and tampered signatures both return `401`.
- Extracted the real console DLLs from the HDD dump. `XblAuthConsoleExt.dll` is a DeviceIoControl/
  bcrypt wrapper with no embedded keys; console `XblAuthManager.dll` loads the console API set.
- Console client static analysis incorporated: the app delegates auth to the OS `AuthManager`
  service, so app-level capture cannot see device auth; devkit proxy/cert path identified.
- IP-to-hostname mapping of a header-only console capture: XSTS, title.mgt, userpresence and
  GSSV region hosts confirmed during a KI 2 launch; device-auth range present but unconfirmed.

### Changed
- Independent review corrections: softened the hardware-attestation claim, narrowed the
  catalogue-gating conclusion, clarified the session-result chronology, relabelled session
  reuse as a limited observation, fixed the certificate-swap protocol, and marked the README
  diagram's allowlist comparison as inferred.
- Added review-proposed tests O–V and protocols G/H.

### Added
- Community DNS observation: launch touches delivery/store hosts, auth not visible (cached),
  which moves the capture window to sign-in/boot.
- `research/capture-protocols.md`: turnkey capture and replay protocols A–F for the open matrix
  items, with token-portability evidence from public tooling.

### Changed
- Closed session-reuse ideas (I/J) with a console owner's report.
- Noted parallel research reporting `WindowsOneCore` for the PC app, and added references.

### Changed
- Samsung TV KI 2 attempt reported as unsuccessful; TV branch downgraded to "details pending".
- Added community-tested negative routes (old Android builds, legacy paths, non-prod hosts,
  TV flow with Xbox headers) to failed approaches.
- Added console-ban risk note for any token-reuse experiment.
- Documented why a retail HDD dump does not yield a decrypted SystemOS.

### Added
- Community-reported items: console KI 2 launch, `SAMSUNGTV` classification on PS4, 2026 Xbox
  One boot ROM glitch and what it would (and would not) enable.

### Changed
- Project renamed to **GTA VI Cloud Research**; repository will move to `gta-vi-cloud-research`.

### Added
- Root `ROADMAP.md` and a restructured `docs/roadmap.md`: unknowns, dependency map and what
  each artifact would unlock.
- `docs/what-we-need.md` — ranked evidence wishlist, including console access options.
- `docs/game-executables.md` — why assets or a leaked executable do not affect cloud access.
- Repository structure, documentation set and branding assets.
- MIT licence (copyright 2026 sixstar).
- Sanitized findings log and experiment index.
- Read-only catalogue scanner (`tools/catalog-scan.mjs`).

### Changed
- "PC never performs device authentication" corrected: `gamingservices.exe` performs RPS
  device authentication over WinHTTP.
- "Missing Play button means no subscription" corrected: the Xbox app was signed in as a
  different account than the API probe.

## 2026-11-20

### Findings
- Console-only titles absent from the `xgpuweb` catalogue (2,863 titles, zero allowlists);
  still present in `xgpuconsole` (2,865 titles, two allowlists).
- A `Win32` device token does not change the `xgpuconsole` catalogue, so catalogue gating is
  per offering rather than per device claim.
- A signed `XboxOne` request with filler attestation fields still returns `400` empty.

## 2026-11-19

### Findings
- `gamingservices.exe` issues `POST /device/authenticate` over WinHTTP with an RPS request
  and no `DeviceType`; the response is a JWE.
- Static analysis: console request builder, producer chain, empty API-set host, and the
  correction that `XblaProcessSpToken` consumes the response token.
- Xbox app launched via the correct AUMID; UI Automation exposes navigation and product
  pages.

### Fixed
- WPF rendering in the VM (`DisableHWAcceleration=1`).
- Interactive task launch replaced with a session-2 process launcher.

## 2026-11-18

### Findings
- KI 2 Classic is the only restricted title in a 2,400-title scan.
- Entitlement identical across KI titles; the allowlist is the only difference.
- Session start: `202` for KI 2013, `400 DeviceTypeNotAllowed` for KI 2 Classic.
- `device.auth` issues `Win32`/`Android`/`iOS`; console classes are refused.
- Device class propagates into the GSSV session token.

### Added
- Initial probe and catalogue tooling.
