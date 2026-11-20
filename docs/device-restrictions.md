# Device restrictions

## What a restriction looks like

Each title in the cloud catalogue may carry `details.allowedDeviceTypes`. An empty or absent
list means unrestricted. A non-empty list means the title is only startable by those device
classes.

Observed snapshots:

| Title | Title ID | Allowlist | Entitlement on test account |
|---|---|---|---|
| Killer Instinct 2 Classic | `KILLERINSTINCT2CLASSIC` | `XBOXONE`, `SCARLETT`, `SAMSUNGTV` | yes |
| GTA VI | `GRANDTHEFTAUTOVI` | `XBOXONE`, `SCARLETT` | no |
| Killer Instinct (2013) | `KILLERINSTINCT` | none | yes |

Across a 2,400-title scan on 2026-11-18, KI 2 Classic was the only restricted entry. GTA VI
appeared later with a console-only allowlist of the same shape.

## Why the control test matters

Same account, same client, back to back:

- KI 2013 → `202 Accepted`, `sessionPath` + `queueConfig`
- KI 2 Classic → `400`, `{"code":"DeviceTypeNotAllowed"}`

Entitlement, region, headers and client version are identical. The only difference is the
title's allowlist. That is why entitlement is not the explanation for the refusal.

## Four different things people conflate

| Layer | Question it answers | Observed behaviour |
|---|---|---|
| **Catalogue visibility** | Is the title listed for this offering? | `xgpuweb` listed it on 2026-11-19, not on 2026-11-20 |
| **Entitlement** | Does the account hold the licence? | `hasEntitlement: true` for KI 2 Classic |
| **Session authorisation** | May this device class start it? | `400 DeviceTypeNotAllowed` on PC |
| **Gameplay** | Did a stream actually start? | Not reached |

A store page, a game card, or a catalogue row is not evidence of the last two.

## Catalogue versus session

**2026-11-19 snapshot**

```
xgpuweb      2800 titles   KI2C present   GTA VI present   restricted: 2
XGPUPCAPP    2800 titles   KI2C absent    GTA VI absent    restricted: 0
```

**2026-11-20 snapshot** (after the GTA VI launch window)

```
xgpuweb      2863 titles   KI2C absent    GTA VI absent    restricted: 0
xgpuconsole  2865 titles   KI2C present   GTA VI present   restricted: 2
```

The console offering kept both titles; the web offering dropped them.

A subsequent test asked whether the console catalogue is filtered by the caller's device
token. Logging into `xgpuconsole` with a `Win32` device token produced the **same** 2,865
titles and the same two restricted entries.

**Result:** catalogue gating is per offering, not per device claim. Session-time device
authorisation is a separate gate.

## Why SAMSUNGTV matters, and why it does not solve GTA VI

KI 2 Classic admits `SAMSUNGTV`; GTA VI does not. Even a perfect Samsung TV identity would
only address the older title. This is why TV hardware is a separate, lower-value branch.

## What a device allowlist is not

- It is not a purchase check — entitlement is a separate field.
- It is not a client user-agent check — header spoofing did not change the result.
- It is not a store-page restriction — the pages are visible on PC.

## Open

- Whether the backend compares the token's `devicetype` directly or consults an internal
  record of the device.
- Whether a title allowing `ANDROID` or `IOS` exists — none was found, so the comparison
  could not be isolated with a permitted class.
