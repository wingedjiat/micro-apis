import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePhone, isValidPhone } from "../src/phone/index.js";

test("Malaysian mobile, national form with country", () => {
  const r = parsePhone("012-345 6789", "MY");
  assert.equal(r.valid, true);
  assert.equal(r.country, "MY");
  assert.equal(r.e164, "+60123456789");
  assert.equal(r.countryCallingCode, "60");
  assert.equal(r.type, "mobile");
  assert.equal(typeof r.national, "string");
});

test("international format needs no country", () => {
  const r = parsePhone("+60123456789");
  assert.equal(r.valid, true);
  assert.equal(r.country, "MY");
});

test("Singapore mobile", () => {
  const r = parsePhone("+65 9123 4567");
  assert.equal(r.valid, true);
  assert.equal(r.country, "SG");
  assert.equal(r.type, "mobile");
});

test("too-short number is invalid", () => {
  const r = parsePhone("+60123");
  assert.equal(r.valid, false);
});

test("national number without a country cannot be resolved", () => {
  const r = parsePhone("012-345 6789");
  assert.equal(r.valid, false);
});

test("empty input is rejected cleanly", () => {
  const r = parsePhone("");
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes("Missing")));
});

test("isValidPhone convenience", () => {
  assert.equal(isValidPhone("+60123456789"), true);
  assert.equal(isValidPhone("not a phone"), false);
});
