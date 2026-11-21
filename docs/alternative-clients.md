# Alternative clients

Open-source and community clients were reviewed to see whether any of them demonstrates an
accepted console-restricted session — and to learn what they actually send.

A client that works for ordinary cloud play is not evidence of a console identity. The gate
only appears on restricted titles.

## Summary

| Project | Platform | What it actually does | New evidence for console identity? |
|---|---|---|---|
| Better xCloud | browser userscript | UI improvements, stream settings, client hints | No |
| Stratix | desktop client | Documents the protocol: auth, titles, session state, WebRTC | No |
| Conch | Node/.NET library | Clean implementation of MSA → device token → XSTS | No (used as a signing reference) |
| Greenlight | Electron client | xCloud + console remote play, session lifecycle | No |
| PSBox | PS4/PS5/Android/Windows client | xCloud playback and decoding work | No |
| DeepPlay / GR33N | modified PS3 | Runs cloud clients on console hardware | No verified restricted session |
| Bannerlator | Android | Cloud token patch, browser-style session start | No |
| GTAXC | community | Browser-script attempts; proposed Xbox One emulator | No |

## Better xCloud

A userscript that improves the web player. It can change client hints and stream settings.
The project is explicit that it does not bypass device restrictions, and no restricted-title
session has been demonstrated through it. Useful for understanding what the web client sends.

## Stratix

Its protocol documentation is one of the clearest public descriptions of the xCloud flow:
authentication, title listing, session state machine, WebRTC negotiation and input channels.
It documents `hasEntitlement` filtering in the library, which is a different concept from
device allowlists.

Value: protocol vocabulary and field names. Not a bypass.

## Conch

A library implementation of the Xbox authentication chain, including device tokens with
proof-of-possession. It was used here as an independent reference for request signing: our
console-field probe builds and signs requests with its `ECDsaPoPCryptoProvider`.

Value: confirms the PoP wire format. It does not attempt console device types.

## Greenlight

A desktop client supporting both xCloud and console remote play. Its title manager exposes
`programs` / `userPrograms` / `subscriptions` from the catalogue, which matches our
observations. No console identity logic.

## PSBox

A multi-platform cloud client (PS4/PS5, Android, Windows) focused on decoding and input.
Its maintainer has discussed the KI 2 Classic restriction publicly: the title is present in
the console catalogue and absent from the PC catalogue. That corroborates the catalogue
difference; it does not provide a way through it.

## DeepPlay / GR33N

Projects that run cloud clients on modified PlayStation 3 hardware. They are interesting
because a PS3 is also not an Xbox — if they worked for restricted titles it would be a real
data point.

What was found:

- **One genuine session is on record.** A 2.5-hour stream from 2026-11-19 shows GTA VI running
  on a PS3 at 29–31 fps over wired Ethernet, launched from stock DeepPlay/GR33N with a game
  purchased on the creator's Xbox account. No spoofing or patched binary is described. The PS3
  XMB reports "Quit Game (DeepPlay)" and the overlay is live decoder telemetry, so the decode
  is real; the stream begins mid-session, so the auth calls are not visible.
- The same creator says access is **now blocked** on PS3, and other viewers report
  `xbox could not start this game (code HTTP 400)`.
- Earlier advertising videos did not show a conclusive, uninterrupted launch; one showed an
  access-denied screen.
- A DeepPlay issue discusses browser-type client behaviour, but it is a community comment,
  not a developer-confirmed identity trace.

So the honest summary is: one working window, no reproduced method. Which device class the PS3
client presented, and whether the title's allowlist was simply not enforced that day, is unknown.
Neither explanation implies a console-class token was obtained.

## Bannerlator

Android client with a cloud-token patch. Inspected behaviour:

- selects `xgpuweb` / `xgpuwebf2p`
- sends `XboxComBrowser` as the client
- session start uses `sdkType: web` and a browser-style `X-MS-Device-Info`

No console identity, no `xgpuconsole` path, no allowlist logic. Its "console-only" wording
refers to games without a native PC package, not to titles with device allowlists.

## GTAXC

Community-reported attempts used browser scripts against the web player, which did not
produce an accepted restricted session. A proposed next step — an Xbox One emulator — has
not been demonstrated to produce a Microsoft-accepted identity. Treated as **community
reported / untested**, not as evidence.

## What none of them show

No public project in this review demonstrates all of:

1. an entitled account,
2. an accepted session for a device-restricted title,
3. an established stream,
4. a method that does not borrow someone else's identity.

Until one does, client projects are context, not proof.
