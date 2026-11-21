# Windows GamingServices and WinHTTP

This is the part of the investigation that corrected an earlier, wrong conclusion.

## The earlier mistake

App-level proxy captures (XMAT "Local PC Web Proxy", WinINET) showed SISU traffic and
presence calls but **no `/device/authenticate`**. We concluded the PC platform does not
perform device authentication.

That conclusion was wrong in scope. `device.auth` traffic exists; it bypasses application
proxies because it is issued by a Windows service over **WinHTTP**.

## Method

1. Record the original WinHTTP state: `netsh winhttp show proxy` → *Direct access*.
2. Point WinHTTP at a local tunnel: `netsh winhttp set proxy 127.0.0.1:<port> "<-loopback>"`.
3. Restart `gamingservices.exe` to force a fresh authentication cycle.
4. Log CONNECT destinations, then optionally terminate TLS for a single host.
5. Restore the original state.

A host-only tunnel was used first; TLS termination was limited to the device-auth host, with
a temporary CA installed to `LocalMachine\Root` and removed afterwards.

## Observed sequence

```
CONNECT title.mgt.xboxlive.com:443     ×2
CONNECT device.auth.xboxlive.com:443
CONNECT sisu.xboxlive.com:443
```

Process attribution: connections to the proxy port were owned by `gamingservices.exe`,
confirmed twice across restarts. `XboxPcApp.exe` was not running during the first capture.

## Request shape

```text
POST /device/authenticate
RelyingParty            string
TokenType               string
Properties.AuthMethod   string  (RPS)
Properties.RpsTicket    string  (credential material — not retained)
Properties.SiteName     string
Properties.Version      string
Properties.DeviceModel  string  (hardware model)
Properties.ProofKey     object
# no DeviceType
```

Two details stand out:

- **No device-class field is sent.** The client reports a model string; it does not choose a
  class.
- `DeviceModel` matched the VM's hardware model string, confirming it is derived from the
  machine rather than configured.

## Response shape

`200 OK` with `IssueInstant`, `NotAfter`, a `Token` that is a **JWE** (header claims
`alg`, `enc`, `zip`, `x5t`, `cty`) and `DisplayClaims.xdi.did`.

Because the token is encrypted to a recipient we do not control, the issued device class is
**not observable** client-side. Observing a `200` does not tell us what class was granted.

## Console counterpart (verified static)

A static analysis of the console client (`Microsoft.xCloudConsole2`) found the app itself never
calls `device.auth` or XSTS. It requests a token from `Windows.System.Internal.XboxLive.Auth.AuthManager`,
a WinRT facade over the out-of-process `XblAuthManager` service — the same DLL analysed here.
The service owns the console request builder and the `Xbla*` attestation provider.

Consequence: app-level capture on a console cannot see `/device/authenticate`. Only a devkit
system-level capture (or a glitched console) can.

## Why this matters

It means there are two distinct Windows paths:

| Path | Who | Device field | Response |
|---|---|---|---|
| PoP (our client) | application | `DeviceType` selected by client | readable JWT |
| RPS (Windows service) | `gamingservices.exe` | none; `DeviceModel` only | JWE |

The RPS path is the one Microsoft's own client uses. It is also the one that cannot be
inspected without breaking encryption.

## After the token

A later host-only trace showed `device.auth → sisu` with **no XSTS or GSSV connections** in
that window. That does not prove the token is unused: a broker, cache or later app sign-in
could consume it. It does mean GamingServices does not forward it to XSTS itself.

## Cleanup

- `netsh winhttp reset proxy` → Direct access restored
- User WinINET proxy cleared
- Temporary CA removed from the machine root store
- Local logs and keys deleted
- Connectivity re-verified (`example.com` → 200)

Anyone repeating this must restore the proxy configuration and remove the CA. Leaving a
local MITM root installed is a real security problem.
