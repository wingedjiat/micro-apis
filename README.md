# micro-apis

Small, pure-compute utility APIs — no database, no external data feeds, nothing
stored. Built to be sold as metered endpoints on an API marketplace.

**First API: Malaysian IC (NRIC) parser & validator.**

- **Hosted API (free tier):** https://rapidapi.com/KiyoTech/api/malaysian-ic-parser-and-validator
- **Live base URL:** https://micro-apis-vert.vercel.app

---

## Malaysian IC parser & validator

Give it a Malaysian IC (MyKad) number and get back its structured parts: date of
birth, age, gender, and place of birth — plus a validity check. Everything runs
in memory; **no input is logged or stored.**

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/ic/parse?ic=YYMMDD-PB-####` | Parse an IC into its parts. |
| GET | `/ic/validate?ic=YYMMDD-PB-####` | Validate an IC (boolean). |
| GET | `/health` | Liveness check. |

Dashes/spaces in the `ic` value are optional (`900101-10-5677` or `900101105677`).

### Example

```
GET /ic/parse?ic=900101-10-5677
```

```json
{
  "input": "900101-10-5677",
  "normalized": "900101105677",
  "valid": true,
  "errors": [],
  "formatted": "900101-10-5677",
  "dateOfBirth": "1990-01-01",
  "centuryInferred": true,
  "age": 36,
  "gender": "male",
  "bornInMalaysia": true,
  "placeOfBirth": { "code": "10", "type": "state", "name": "Selangor" }
}
```

### Fields

- **valid** — `true` only when the format, the calendar date, and the birthplace
  code are all valid.
- **errors** — reasons it is invalid (empty when valid).
- **dateOfBirth** / **centuryInferred** — the IC does not encode the century, so
  the year is inferred (serial-digit hint, then year sanity, never a future
  year). `centuryInferred` is always `true` as a reminder it is a best guess.
- **gender** — derived from the last digit by the common convention
  (odd = male, even = female).
- **placeOfBirth.type** — `state` (born in Malaysia), `country`, `region` (the
  code identifies a region, not one country), or `special`
  (e.g. "Unknown state", "Stateless").
- **bornInMalaysia** — `true` only for `state` codes.

### What "valid" checks (and does not)

Validation covers **format (12 digits) + a real calendar date + an assigned
birthplace code.** JPN publishes **no official checksum** for the IC number, so
this service does not claim one, and a `valid: true` result means "well-formed
and internally consistent," **not** "confirmed against any government record."
It performs format validation only; it does not verify identity.

Birthplace codes follow the community-maintained list on Wikipedia
("Malaysian identity card"); they are not an official JPN publication.

---

## Run locally

```
npm start        # starts the HTTP server on http://localhost:3000
npm test         # runs the unit tests (node --test, zero dependencies)
```

## Deploy

**Live:** https://micro-apis-vert.vercel.app (`/ic/parse`, `/ic/validate`, `/health`).

- **Vercel / any Node host**: `server.js` is the HTTP handler; Vercel runs it
  directly, so the endpoints are `/ic/parse`, `/ic/validate`, `/health`.
- The functions in `/api` are an alternative entry for hosts that prefer
  per-file serverless functions; they are not used by the Vercel deploy above.
- `openapi.json` describes the API (import it into an API marketplace).

## Project layout

```
src/ic/index.js        core parser & validator (pure functions)
src/ic/birthplace.js   birthplace-code table
api/parse.js           Vercel serverless handler
server.js              zero-dependency HTTP server
test/ic.test.js        unit tests
```
