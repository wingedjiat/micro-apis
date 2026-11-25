// Malaysian IC (NRIC / MyKad) parser & validator — pure functions, no I/O.
//
// Format: YYMMDD-PB-#### (12 digits).
//   YYMMDD = date of birth (century is NOT encoded in the number)
//   PB     = birthplace code (see birthplace.js)
//   ####   = serial; the last digit encodes gender by the common convention
//            (odd = male, even = female). JPN publishes no official spec for
//            this or for any checksum, so we validate only what is verifiable:
//            format + a real calendar date + an assigned birthplace code.

import { BIRTHPLACE } from "./birthplace.js";

export function normalizeIC(input) {
  return String(input ?? "").replace(/[\s-]/g, "");
}

/**
 * Parse a Malaysian IC number into its parts.
 * Always returns an object with `valid` and `errors`; fields are filled in as
 * far as the input allows.
 */
export function parseMalaysianIC(input) {
  const raw = String(input ?? "");
  const ic = normalizeIC(raw);
  const errors = [];

  if (!/^\d{12}$/.test(ic)) {
    errors.push("IC must be exactly 12 digits (format YYMMDD-PB-####).");
    return { input: raw, normalized: ic, valid: false, errors };
  }

  const yy = ic.slice(0, 2);
  const mm = ic.slice(2, 4);
  const dd = ic.slice(6 - 2, 6); // digits 5-6
  const pb = ic.slice(6, 8);
  const serial = ic.slice(8, 12);
  const lastDigit = Number(ic[11]);

  // --- Date of birth (infer the century) ---
  // Primary hint: the first serial digit (pre-2000 births usually start 5/6/7,
  // 2000-on usually start 0/1/2/3). Fallback: compare with the current year.
  // Never allow a future birth year.
  const now = new Date();
  const thisYear = now.getFullYear();
  const firstSerial = Number(serial[0]);
  let century;
  if ([0, 1, 2, 3].includes(firstSerial)) century = 2000;
  else if ([5, 6, 7].includes(firstSerial)) century = 1900;
  else century = Number(yy) <= thisYear % 100 ? 2000 : 1900;

  let fullYear = century + Number(yy);
  if (fullYear > thisYear) fullYear -= 100;

  const month = Number(mm);
  const day = Number(dd);
  const d = new Date(fullYear, month - 1, day);
  const dateValid =
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    d.getFullYear() === fullYear &&
    d.getMonth() === month - 1 &&
    d.getDate() === day;

  let dateOfBirth = null;
  let age = null;
  if (dateValid) {
    dateOfBirth = `${fullYear}-${mm}-${dd}`;
    age = ageFrom(d, now);
  } else {
    errors.push(`Invalid date of birth (year ${yy}, month ${mm}, day ${dd}).`);
  }

  // --- Birthplace ---
  const entry = BIRTHPLACE[pb];
  let placeOfBirth;
  if (!entry || entry.type === "na") {
    errors.push(`Unknown or unassigned birthplace code "${pb}".`);
    placeOfBirth = { code: pb, type: "unknown", name: null };
  } else {
    placeOfBirth = { code: pb, type: entry.type, name: entry.name };
  }

  const gender = lastDigit % 2 === 1 ? "male" : "female";
  const valid = dateValid && placeOfBirth.type !== "unknown";

  return {
    input: raw,
    normalized: ic,
    valid,
    errors,
    formatted: `${yy}${mm}${dd}-${pb}-${serial}`,
    dateOfBirth,
    centuryInferred: true,
    age,
    gender,
    bornInMalaysia: placeOfBirth.type === "state",
    placeOfBirth,
  };
}

/** True only when format, date, and birthplace code are all valid. */
export function isValidMalaysianIC(input) {
  return parseMalaysianIC(input).valid;
}

function ageFrom(birth, now) {
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}
