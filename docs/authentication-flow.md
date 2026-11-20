# Authentication flow

End-to-end view of the chain that ends in a cloud session. Field **names** are published;
field **values** are not.

## 1. Device authentication

Endpoint: `POST https://device.auth.xboxlive.com/device/authenticate`

Two request shapes were observed.

**Client proof-of-possession (our synthetic client)**

```json
{
  "RelyingParty": "<24 chars>",
  "TokenType": "JWT",
  "Properties": {
    "AuthMethod": "ProofOfPossession",
    "DeviceType": "Win32",
    "Id": "{GUID}",
    "ProofKey": { "kty": "EC", "alg": "ES256", "crv": "P-256", "use": "sig", "x": "...", "y": "..." },
    "Version": "10.0.22000"
  }
}
```

Signed with the Xbox Live PoP scheme: a header of policy version, FILETIME and an ECDSA
P-1363 signature over the request, plus a `Signature` header and
`x-xbl-contract-version: 2`.

**Windows system service (RPS)**

```text
RelyingParty            string
TokenType               string
Properties.AuthMethod   string  (RPS)
Properties.RpsTicket    string  (credential material — never retained)
Properties.SiteName     string
Properties.Version      string
Properties.DeviceModel  string  (hardware model)
Properties.ProofKey     object
# no DeviceType field
```

Outcome:

| Request | Status | Token |
|---|---|---|
| `Win32`, `Android`, `iOS` | `200` | issued |
| console types | `400` | none, empty body |

## 2. XSTS authorisation

Endpoint: `POST https://xsts.auth.xboxlive.com/xsts/authorize`

```json
{
  "Properties": {
    "UserTokens": ["<user token>"],
    "DeviceToken": "<device token, optional>",
    "SandboxId": "RETAIL"
  },
  "RelyingParty": "http://gssv.xboxlive.com/",
  "TokenType": "JWT"
}
```

Passing a device token as a member of `UserTokens` fails; it must be
`Properties.DeviceToken` (observed `400` vs `200`).

## 3. GSSV login

Endpoint: `POST https://<offering>.gssv-play-prod.xboxlive.com/v2/login/user`

```json
{ "token": "<XSTS token>", "offeringId": "xgpuweb" }
```

Headers include `x-gssv-client` and a client user agent. The response contains a `gsToken`
(an ordinary JWT) and `offeringSettings` with regions and base URIs.

**Device class propagation** (locally tested):

| XSTS input | `gsToken.devicetype` |
|---|---|
| user token only | absent |
| user + `Win32` device token | `Win32` |
| user + `Android` device token | `Android` |
| user + `iOS` device token | `iOS` |

## 4. Session start

Endpoint: `POST /v5/sessions/cloud/play` on the region base URI.

| Case | Result |
|---|---|
| KI 2013, ordinary PC identity | `202` with `sessionPath` and `queueConfig` |
| KI 2 Classic, ordinary PC identity | `400` `{"code":"DeviceTypeNotAllowed"}` |

The refusal arrives in roughly 400 ms, before queue or instance allocation, and contains no
`sessionPath`.

## 5. Where the decision is made

**Observed:** the device class is present in the session token, the refused title carries an
allowlist, and the accepted title does not.

**Inferred:** GSSV compares the authenticated device class (and possibly other attributes)
against `allowedDeviceTypes` during authorisation. The comparison itself was not observed.

**New (2026-11-20):** the web offering no longer lists the restricted titles at all, which
means filtering also happens when the catalogue is built. See
[device-restrictions.md](device-restrictions.md#catalogue-versus-session).

## Diagram

```mermaid
sequenceDiagram
    participant C as Client
    participant D as device.auth
    participant X as XSTS
    participant G as GSSV
    participant S as Session API
    C->>D: PoP or RPS request
    D-->>C: device token (or 400)
    C->>X: user token + device token
    X-->>C: JWT with device claims
    C->>G: /v2/login/user
    G-->>C: gsToken (devicetype)
    C->>S: /v5/sessions/cloud/play
    S-->>C: 202 sessionPath / 400 DeviceTypeNotAllowed
```
