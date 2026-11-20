# Experiment index

Maps experiment identifiers to outcomes and the document that interprets them. Raw captures
are **not** published.

| ID | Area | Outcome | Interpreted in |
|---|---|---|---|
| E01 | Catalogue allowlist scan | One restricted title found (2026-11-18) | [device-restrictions](../docs/device-restrictions.md) |
| E02 | Entitlement comparison | Restricted title is entitled | [device-restrictions](../docs/device-restrictions.md) |
| E03 | Session start, control vs target | `202` vs `400 DeviceTypeNotAllowed` | [authentication-flow](../docs/authentication-flow.md) |
| E04 | Header/metadata sweep | All refused | [failed-approaches](../docs/failed-approaches.md) |
| E05 | Console offering sweep | All refused | [failed-approaches](../docs/failed-approaches.md) |
| E06 | PC offering catalogue | Restricted titles absent | [xsts-and-gssv](../docs/xsts-and-gssv.md) |
| E07 | Device type matrix | `Win32`/`Android`/`iOS` only | [authentication-flow](../docs/authentication-flow.md) |
| E08 | Offline PoP verification | Signatures valid | [methodology](../docs/methodology.md) |
| E09 | Console fields probe | Still `400` empty | [console-attestation](../docs/console-attestation.md) |
| E10 | XSTS device token propagation | `gsToken.devicetype` matches | [xsts-and-gssv](../docs/xsts-and-gssv.md) |
| E11 | App proxy capture | No `device.auth` at app layer | [windows-gamingservices](../docs/windows-gamingservices.md) |
| E12 | WinHTTP capture | `gamingservices.exe` RPS request | [windows-gamingservices](../docs/windows-gamingservices.md) |
| E13 | Host-only trace after restart | `device.auth → sisu`, no XSTS | [windows-gamingservices](../docs/windows-gamingservices.md) |
| E14 | Xbox app UIA | Navigation and product pages reachable | [xbox-app-investigation](../docs/xbox-app-investigation.md) |
| E15 | Play-button comparison | F2P title offers cloud play | [xbox-app-investigation](../docs/xbox-app-investigation.md) |
| E16 | Account comparison | App and API accounts differ | [xbox-app-investigation](../docs/xbox-app-investigation.md) |
| E17 | Static analysis, builder | Field set recovered | [reverse-engineering](../docs/reverse-engineering.md) |
| E18 | API-set mapping | Empty host | [reverse-engineering](../docs/reverse-engineering.md) |
| E19 | Catalogue drift check | Web offering dropped restrictions | [device-restrictions](../docs/device-restrictions.md) |
| E20 | Console catalogue with Win32 token | No change | [device-restrictions](../docs/device-restrictions.md) |

## Status vocabulary

- **Completed** — a result exists and is recorded.
- **Blocked** — needs hardware or an interactive sign-in.
- **Not run** — deliberately skipped (for example, GTA VI session start without entitlement).
