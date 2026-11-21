# Capture protocols

Turnkey steps for the open matrix items. Everything here is metadata-only: field names,
status codes, claim categories. No token values leave the tester's machine.

## Why this is worth doing

Two public artifacts suggest device tokens are **bearer credentials**, not channel-bound:

- `XboxAuthTool` takes a console device token and mints tokens for other relying parties — a
  token used off the device it came from.
- `ToastMyConsole` (patched 2019) extracted XSTS user and device tokens from consoles and sent
  them to a server for collection. Exfiltrating tokens would be pointless if they only worked
  on the originating console.

That is evidence, not proof. The replay test is what settles it.

## Protocol A — capture a console device token and replay from PC

**Tester needs:** a **devkit**, not a retail console in Dev Mode. Static analysis of the console
client shows the app never calls `device.auth` or XSTS: it asks the OS `AuthManager` service for a
token. The service, not the app, performs device authentication. An app-level proxy therefore
cannot see the request.

The devkit path exists in `XblAuthConsoleExt.dll` (`XblaCopyProxyAndCertFilesFromUSB`), which loads
proxy settings and certificates from `s:\microsoft\cert\*.cer`, including a `FiddlerRoot.cer`
literal. That is the sanctioned capture route and it is devkit-only.

Verify capture coverage with an ordinary request before trusting any absence. A Windows PC runs
XMAT.

1. Enable dev mode, install XMAT on the PC, point the console at the PC proxy.
2. **Capture around sign-in or reboot, not only around launch.** A console owner's DNS logs
   during a launch showed delivery and store hosts but no auth host, which suggests the device
   token is issued once at sign-in/boot and then cached. If the capture starts at launch, the
   interesting request may already have happened.
3. Launch Killer Instinct 2 Classic from the console.
4. In XMAT, look for `device.auth.xboxlive.com`.
   - If it is not present, stop: the auth is below the app layer and dev mode cannot see it.
     Record that, it is a result.
5. If present, note:
   - HTTP status,
   - request field names (no values),
   - whether a token is returned and its type (JWT vs JWE).
6. Copy the device token **locally only**. Do not paste it anywhere.
7. On the PC, run the token through XSTS as `Properties.DeviceToken`, then GSSV login, then
   session start for the same title.
8. Report only: statuses, `gsToken.devicetype`, and the session response code.

| Result | Meaning |
|---|---|
| Session `202` | Tokens are portable; a console can mint access for a PC |
| `400 DeviceTypeNotAllowed` | The class is right but something else binds it to the console |
| `401` | Token is single-use, expired, or bound to the channel |

## Protocol B — borrow the `gsToken` instead

Same capture, but skip device auth entirely:

1. Capture the `gsToken` the console receives from GSSV.
2. From the PC, call `/v5/sessions/cloud/play` with `Authorization: Bearer <gsToken>`.
3. Report the status.

This tests the highest layer first. If it works, no device token is needed at all.

## Protocol C — replay the device-auth request

1. Capture one `/device/authenticate` request, all headers included.
2. Replay it unchanged from a PC within 60 seconds.
3. Then replay it again after 10 minutes.

| Result | Meaning |
|---|---|
| Both accepted | No freshness binding |
| First accepted, second rejected | Timestamp/nonce window enforced |
| Both rejected | Bound to the channel or the source device |

## Protocol D — cross-console certificate swap

Needs **two consoles** and, critically, a **valid signature over the modified body**. The PoP
signature covers the request, so swapping a certificate while keeping A's signature is expected
to fail for a trivial reason and proves nothing about device records.

The meaningful version is only possible with B's signing key available to sign a body that
carries A's certificate — i.e. a console with extractable keys. Without that, skip this protocol.

## Capture hygiene

A submitted hotspot capture had a **snaplen of 82 bytes**, which records Ethernet/IP/TCP headers
and nothing else: no TLS ClientHello, no SNI, no DNS answers, no payload. It showed 543
connections to Microsoft and Akamai ranges over eight minutes and told us nothing about hosts.

Always capture with `-s 0` (full packets) and include DNS:

```
tcpdump -i <iface> -s 0 -w capture.pcap
```

Verify before sending: a ClientHello packet should be several hundred bytes, and DNS queries
should appear in the file.

## Protocol G — full session lifecycle

Capture the whole path, not just authentication:

```
POST /v5/sessions/cloud/play
  → session state polling
  → /connect
  → SDP/ICE
  → first decoded frame
```

Record: offering, region, title ID, status codes, `queueConfig` presence, state transitions,
error category, correlation IDs, and whether a separate Long Play Token is required (name only,
never the value).

A console `202` and a PC `500` for the same title and account at roughly the same time would
narrow the failure sharply. A console-side `500` would instead suggest a title or service
problem.

## Protocol H — token portability, no console

Before borrowing a console token, check whether a normal PC token is portable at all:

1. Take one legitimate `Win32` `gsToken`.
2. Use it for a session start on the same account from two different processes/environments you
   control.
3. Record status and whether a session is created or reused.

If a PC token cannot be reused even by the same account elsewhere, a session/token binding
mechanism exists and must be understood before blaming attestation. If it can, tokens are at
least transport-tolerant for the PC flow.

## Protocol E — clock and nonce edges

From a captured request, replay with:

- a timestamp 30 seconds in the past,
- a timestamp 30 seconds in the future,
- a reused nonce with a fresh signature.

Record which are accepted.

## Protocol F — keys

Only relevant if a console is glitched. Not requested, not recommended, and out of scope for
this project's testers.

## What to send back

```
protocol:      A / B / C / D / E
console:       model + firmware
dev mode:      yes/no
device.auth:   visible / not visible
statuses:      device.auth ___, xsts ___, gssv ___, play ___
devicetype:    claim value only (or "none")
notes:         anything unexpected
```

Never send the token, the certificate, the request body, or a capture file.

## Safety

- Throwaway Microsoft account.
- A console you are willing to risk; a relay pattern can attract attention.
- No public posting of captures.
- Stop if anything asks for your password or MFA in a tool.
