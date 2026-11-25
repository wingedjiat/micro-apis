// Phone number parser & validator for Southeast Asia (and anywhere else).
// Thin, reliable wrapper over libphonenumber-js — the hard parts (per-country
// number ranges, line types, formatting) are what the library exists to solve.

import { parsePhoneNumberFromString } from "libphonenumber-js/max";

// Countries this API is marketed for; any ISO country code actually works.
export const SEA_COUNTRIES = ["MY", "SG", "ID", "TH", "PH", "VN"];

/**
 * Parse a phone number into its parts. Pass `country` (ISO code, e.g. "MY") when
 * the number is in national form (e.g. "012-345 6789"); numbers already in
 * international form ("+60…") don't need it.
 */
export function parsePhone(input, country) {
  const raw = String(input ?? "");
  const errors = [];

  if (!raw.trim()) {
    errors.push("Missing phone number.");
    return { input: raw, valid: false, errors };
  }

  const defaultCountry = country ? String(country).trim().toUpperCase() : undefined;
  let p;
  try {
    p = parsePhoneNumberFromString(raw, defaultCountry);
  } catch {
    p = undefined;
  }

  if (!p) {
    errors.push('Could not parse the number — add a country code (e.g. country=MY) or use international format (+60…).');
    return { input: raw, valid: false, errors };
  }

  const valid = p.isValid();
  if (!valid) errors.push("Number is not valid for its country.");

  const type = typeof p.getType === "function" ? p.getType() : undefined;

  return {
    input: raw,
    valid,
    errors,
    e164: p.number, // e.g. "+60123456789"
    national: p.formatNational(), // e.g. "012-345 6789"
    international: p.formatInternational(), // e.g. "+60 12-345 6789"
    country: p.country || null, // ISO code, e.g. "MY"
    countryCallingCode: p.countryCallingCode || null, // e.g. "60"
    type: type ? type.toLowerCase() : null, // "mobile" | "fixed_line" | ...
  };
}

/** True when the number is valid for its (detected or given) country. */
export function isValidPhone(input, country) {
  return parsePhone(input, country).valid;
}
