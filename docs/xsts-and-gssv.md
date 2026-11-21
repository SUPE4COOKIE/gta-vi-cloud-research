# XSTS and GSSV

## XSTS

`xsts.auth.xboxlive.com` exchanges Xbox user and device tokens for a relying-party token.

Observed request shape:

```json
{
  "Properties": {
    "UserTokens": ["..."],
    "DeviceToken": "...",
    "SandboxId": "RETAIL"
  },
  "RelyingParty": "http://gssv.xboxlive.com/",
  "TokenType": "JWT"
}
```

Notes from testing:

- A device token placed inside `UserTokens` is rejected (`400`); it belongs in
  `Properties.DeviceToken`.
- The response `DisplayClaims.xui` entry often contains only `uhs` for this relying party;
  XUID and gamertag are not guaranteed to be present.
- The token is opaque to us; claims of interest are read downstream, not here.
- A console-minted device token is an **XCOS** token (~3.5 KB). One minted on a Series S in Dev
  Mode is refused for `RETAIL` with `401` / XErr `0x8015DC19`, even though `device.auth` returned
  `200` for it minutes earlier.

## GSSV login

`POST https://<offering>.gssv-play-prod.xboxlive.com/v2/login/user`

```json
{ "token": "<XSTS token>", "offeringId": "xgpuweb" }
```

Response:

- `gsToken` — JWT used as `Authorization: Bearer` for catalogue and session calls
- `offeringSettings.regions[]` — region `name`, `baseUri`, `isDefault`

The `gsToken` claim set observed includes: `accountCountry`, `country`, `countrycode`,
`sandboxid`, `userid`, `puid`, `xuid`, `xusFlights`, `dnaGroups`, `gamingConsents`,
`ageGroup`, `userRootOfTrust`, `partnerid`, `offeringid`, `instanceid`, `type`, `version`,
`nbf`, `exp`, `iat`, `iss`, `aud`, and — when a device token was supplied — `devicetype`.

## Device class propagation

| XSTS input | `gsToken.devicetype` |
|---|---|
| user token only | absent |
| user + `Win32` | `Win32` |
| user + `Android` | `Android` |
| user + `iOS` | `iOS` |

Microsoft's own token documentation lists the `dty` claim in the `xdi` block with values such as
`Scarlett`, `XboxOne` and `Windows` (see references). That matches the classes observed here and
confirms the claim is the device-class carrier, not a client string.

Parallel public research reports that the official Windows app's cloud token carries
`WindowsOneCore` rather than `Win32` (community reported, 2026-11-18). Both are non-console
classes; the difference does not change the gate.

This is the observation that makes the device token the interesting object. The device
class is not a header, not a query parameter, and not configurable in the session request.

## Other authenticated attributes

Microsoft's token documentation also describes device capability (`dca`), debug mode (`ddm`),
pairwise identity (`dpi`), title identity (`xti`) and sandbox (`sbx`) claims. Our model focuses
on `dty`, but these are candidates for additional server-side inputs and have not been compared
between authenticated `Win32` and official Windows clients.

## Offerings

| Offering | Where it appears | Restricted titles |
|---|---|---|
| `xgpuweb` | browser / web clients | listed 2026-11-19, absent 2026-11-20 |
| `xgpuconsole` | console clients | listed, with allowlists |
| `XGPUPCAPP` | official Windows Xbox app | both restricted titles absent |
| `xhome` | console remote play (requires a linked console) | n/a |

The PC app uses `XGPUPCAPP` and logs the substitution explicitly:

```
EndpointSettings replacing domain https://gssv-play-prod.xboxlive.com
  with new domain https://XGPUPCAPP.gssv-play-prod.xboxlive.com
```

Because that offering's catalogue excludes the restricted titles, no device spoof inside
the app can surface them.

## Catalogue calls

```
GET <region.baseUri>/v2/titles?mr=200[&ct=<continuation>]
Authorization: Bearer <gsToken>
x-gssv-client: <client>
```

Pagination is via `continuationToken`. A full scan is roughly 15 pages at `mr=200`.

## Session call

```
POST <region.baseUri>/v5/sessions/cloud/play
Authorization: Bearer <gsToken>
```

Accepted response: `202` with `sessionPath` and `queueConfig`.

Refused response: `400` with `code: DeviceTypeNotAllowed`, no session path.

## What is inferred, not observed

- That the server compares `devicetype` against `allowedDeviceTypes`.
- That other authenticated attributes (title token, console record, attestation) participate
  in the same decision.

The claim propagation is measured; the comparison is inferred.
