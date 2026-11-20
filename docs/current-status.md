# Current status

**Snapshot:** 2026-11-20. Service behaviour changes without notice.

## Headline

| Track | State |
|---|---|
| Research understanding | ~47% (subjective estimate) |
| Functional console impersonation | 0% |
| Restricted title launched on PC | No |
| GTA VI cloud gameplay on PC | Not achieved |

The percentage is an honest guess at how much of the decision surface is mapped. It is not
a test metric and should not be read as "47% of a bypass".

## What is established

| Claim | Level |
|---|---|
| Device allowlists exist per title and are enforced at session start | Locally tested |
| KI 2013 starts (`202`) while KI 2 Classic is refused (`400 DeviceTypeNotAllowed`) on the same account | Locally tested |
| Device class travels from the device token into the GSSV session claim | Locally tested |
| `device.auth` issues `Win32`, `Android`, `iOS` and refuses console classes | Locally tested |
| PoP signatures for console requests were structurally valid | Locally tested (offline verification of fresh requests) |
| The console request builder serialises certificate, attestation, boot log/PCR, SP token | Verified (static) |
| The console provider API set has no implementation host on desktop Windows | Verified (schema + binary) |
| `gamingservices.exe` performs RPS device authentication over WinHTTP | Locally tested |
| Windows device tokens are returned as JWE and not readable client-side | Locally tested |
| The PC-app offering excludes the restricted titles | Locally tested |
| Adding console fields to a `device.auth` request does not change the refusal | Locally tested |
| Catalogue gating is per offering, not per device token | Locally tested |

## What is not established

- The exact server-side acceptance rule for console identities.
- Whether a genuine attestation is sufficient by itself, or whether the server also checks a
  registered console record.
- Whether the official Windows RPS device token influences downstream XSTS/GSSV claims.
- Whether a real Samsung TV can start KI 2 Classic.
- Whether the `xgpuweb` catalogue exclusion (observed 2026-11-20) is permanent.

## Completion criteria

A working result requires all of:

1. a legitimately entitled account,
2. an accepted session for a device-restricted title,
3. an established stream reaching gameplay,
4. a method that does not borrow another person's identity.

Anything less is progress, not success.

## Status of the test account

- Entitled to KI 2 Classic; not entitled to GTA VI.
- No console linked, so `xhome` console streaming is unavailable.
- The Windows Xbox app was found to be signed in as a **different account** than the API
  probe account; see [xbox-app-investigation.md](xbox-app-investigation.md). This explains
  earlier "missing Play button" confusion and is not a device-identity result.

## Community reports not yet reproduced here

- An Xbox owner reports KI 2 Classic reaching the "Launching with cloud gaming" screen on a
  real console (2026-11-20). **Gameplay and console model are still unconfirmed** — the
  screenshot shows the loading screen, not a match. Treat the premise as partially confirmed.
- The maintainer reports KI 2 Classic **did not start on a Samsung TV**, despite `SAMSUNGTV`
  being in the allowlist. Details pending. This weakens the TV branch and the PS4/TV-class
  claim below.
- A PS4 homebrew setup is reported to be identified as `SAMSUNGTV` in its device class. If
  true, it is the first non-TV client reported to hold that class — relevant to KI 2 Classic,
  not GTA VI.
- The 2026 Xbox One boot ROM glitch is reported to yield key dumps and SystemOS decryption.
  Not reproduced, not requested, and not required for any test we can run today.

## Snapshot drift

Catalogue contents changed during the project:

- 2026-11-19: `xgpuweb` listed both restricted titles with allowlists.
- 2026-11-20: `xgpuweb` no longer lists either; `xgpuconsole` still does.

Treat every catalogue table as a dated snapshot.
