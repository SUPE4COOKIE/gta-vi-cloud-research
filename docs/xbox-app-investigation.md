# Xbox app investigation

The official Xbox app for Windows was used to study how the vendor's own client behaves, and
to look for a cloud session we could trace without impersonating anything.

## Something that is not a finding

Automation friction is not evidence. Several hours went into launch and UI issues that had
nothing to do with authentication. These are recorded so nobody repeats them.

| Problem | Cause | Fix |
|---|---|---|
| App would not start from `shell:AppsFolder` | Wrong AUMID | Correct AUMID is `Microsoft.GamingApp_8wekyb3d8bbwe!Microsoft.Xbox.App` |
| Scheduled interactive tasks stayed `Queued` after a VM resume | Interactive task session lost | Launch via `WTSQueryUserToken` + `CreateProcessAsUser` on `winsta0\default` |
| XMAT window rendered black | WPF hardware acceleration under the VM GPU | `HKLM\SOFTWARE\Microsoft\Avalon.Graphics\DisableHWAcceleration = 1` |
| UI Automation refused clicks | App window not in the foreground (our own console owned it) | Spawn automation without a console window |

## UI Automation

The app is reachable through Windows UI Automation. With WinApp CLI 0.8.0 the following are
visible and invokable:

```
MenuItem "Home" / "Game Pass" / "My Library" / "Cloud Gaming" / "Store"
Edit "Search"
List "Cloud Gaming", "Most Recent", "Play with Game Pass"
PdpTile-* buttons for catalogue items
```

Navigation and search work. Element identifiers change when views are recreated, so selectors
must be resolved fresh for each action.

## The missing Play button

Killer Instinct (2013) showed:

```
Button "Subscribe, Included in Premium"
Button "Show in store"
Button "Share"
```

and no Play action. That looked like a subscription problem. It was not the whole story.

The same app, same session, on Fortnite:

```
Button "Play with Cloud, Free with ads"
Button "Install"
Button "Add to Wishlist"
```

So the client does offer cloud play, including on a free tier.

## The actual explanation: two accounts

The app was signed in as a different Microsoft account than the one used for the API
experiments. Verified by comparing the XUIDs from the app's own SISU profile response and
the API probe's session token — the values differ. (Identifiers are withheld from this
repository.)

That account does not own Killer Instinct and has no subscription, so a Subscribe button is
the correct rendering. The API account does own KI 2 Classic and has an Ultimate-tier
program, which is why the API could attempt a session.

**This resolves the contradiction.** It is an account mismatch, not a client bug and not a
device-class result.

## Edge comparison

`xbox.com/play` was loaded in Edge and inspected through UI Automation:

- Fortnite's product page exposes a "Play with Cloud Gaming" list item.
- No account identity was rendered in the page header — the browser session was not signed
  in.
- Invoking the item did not navigate; it requires sign-in.

So the browser surface and the native app were not comparable: one signed in, one not.

## Official-client observations

From the app's own log (`Microsoft.GamingApp_8wekyb3d8bbwe\LocalState\gamestreaming_log_0.txt`):

```
DeviceType: Manufacturer: <VM vendor>, Model: <VM model>
Authenticate user with offering xhome
Authenticate user with offering XGPUPCAPP
EndpointSettings replacing domain https://gssv-play-prod.xboxlive.com
  with new domain https://XGPUPCAPP.gssv-play-prod.xboxlive.com
```

That confirms:

- the PC app uses `XGPUPCAPP`, whose catalogue excludes the restricted titles;
- the device model is read from hardware, not configured.

## What we did not get

A fresh official-client GSSV session trace. The app's login attempts during proxy testing
failed with WinHTTP `12029` because the proxy had been removed while the process still had
the old configuration cached. Those failures are contamination and are not used as evidence.

Closing this would require signing the app in as the API account — an interactive credential
step that was deliberately not automated.
