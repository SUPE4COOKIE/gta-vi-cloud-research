# Methodology and evidence levels

This project deals with a proprietary authentication system. The fastest way to produce
misinformation is to blur the line between "we saw it", "we inferred it" and "someone said
so". Every substantive claim is therefore labelled.

## Evidence levels

| Label | Meaning | Example |
|---|---|---|
| **Verified** | Supported by inspected public source, schema, documentation or binary analysis that another person can repeat | The console API set maps to an empty host in `apisetschema.dll` |
| **Locally tested** | Produced by our own experiments, with the conditions recorded | KI 2 Classic returned `400 DeviceTypeNotAllowed` while KI 2013 returned `202` |
| **Community reported** | Reported by a third party; we did not reproduce it | A GTA VI owner reports `userPrograms ["FERDINAND"]` and 1800-second sessions |
| **Inferred** | Best explanation consistent with the evidence, not demonstrated | GSSV compares `gsToken.devicetype` against `allowedDeviceTypes` |
| **Untested** | Proposed, no result either way | Whether a real Samsung TV can start KI 2 Classic |
| **Ruled out** | A specific approach was tested and failed | Client header and device-metadata spoofing in the tested combinations |

## Rules we hold ourselves to

1. **A successful command is not a successful result.** HTTP 200 from device
   authentication does not mean a console identity was accepted. A catalogue entry does not
   mean a session can start. A session start does not mean gameplay was reached.
2. **Negative results are results.** The bulk of this project is knowing which surfaces do
   not move the gate.
3. **No retroactive verification.** If raw request bytes were not preserved, we do not claim
   a historical response was verified offline.
4. **"Impossible" is not used** unless a mechanism makes it impossible. Most conclusions
   here are "not achieved" or "not demonstrated", not "impossible".
5. **Secrets stay out.** Token values, tickets, certificates, keys, cookies and personal
   identifiers never appear in documentation, logs or screenshots.
6. **Third-party claims are labelled.** A video, a store listing or a successful login is
   not proof of a working bypass.

## What counts as a working result

All four conditions must hold:

1. The tested account is legitimately entitled to the title.
2. The service returns an **accepted session** for a device-restricted control title.
3. A real stream is established and gameplay is reached.
4. The method works without borrowing another person's credentials or device identity.

A `200` from `/device/authenticate`, a game card in a launcher, or a GSSV token with an
unverified device class does **not** satisfy this.

## Reproducibility

Where possible, documents include:

- the exact endpoint or binary analysed,
- the request shape (field names and types, never values),
- the HTTP status and error string,
- the tool or method used,
- the date of the snapshot.

Catalogue data and service behaviour are time-sensitive. Treat any table without a date as
historical.
