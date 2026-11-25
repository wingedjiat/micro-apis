import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMalaysianIC, isValidMalaysianIC, normalizeIC } from "../src/ic/index.js";

test("valid domestic IC, male, Selangor", () => {
  const r = parseMalaysianIC("900101-10-5677");
  assert.equal(r.valid, true);
  assert.equal(r.dateOfBirth, "1990-01-01");
  assert.equal(r.gender, "male");
  assert.equal(r.bornInMalaysia, true);
  assert.deepEqual(r.placeOfBirth, { code: "10", type: "state", name: "Selangor" });
  assert.equal(typeof r.age, "number");
  assert.deepEqual(r.errors, []);
});

test("last digit parity sets gender", () => {
  assert.equal(parseMalaysianIC("900101-10-5678").gender, "female");
  assert.equal(parseMalaysianIC("900101-10-5677").gender, "male");
});

test("century inferred from serial — 2000s", () => {
  const r = parseMalaysianIC("010203-14-0321");
  assert.equal(r.dateOfBirth, "2001-02-03");
  assert.equal(r.placeOfBirth.name, "Kuala Lumpur");
  assert.equal(r.valid, true);
});

test("foreign birthplace is valid but not born in Malaysia", () => {
  const r = parseMalaysianIC("880101-66-5673");
  assert.equal(r.valid, true);
  assert.equal(r.bornInMalaysia, false);
  assert.deepEqual(r.placeOfBirth, { code: "66", type: "country", name: "Singapore" });
});

test("region-group code resolves to a region", () => {
  const r = parseMalaysianIC("900101-86-5671");
  assert.equal(r.valid, true);
  assert.equal(r.placeOfBirth.type, "region");
  assert.equal(r.placeOfBirth.name, "Western Europe");
  assert.equal(r.bornInMalaysia, false);
});

test("overflow state code maps to the right state", () => {
  assert.equal(parseMalaysianIC("750615-23-5671").placeOfBirth.name, "Johor");
});

test("leap day is valid in a leap year", () => {
  const r = parseMalaysianIC("000229-10-0121");
  assert.equal(r.valid, true);
  assert.equal(r.dateOfBirth, "2000-02-29");
});

test("leap day invalid in a non-leap year", () => {
  const r = parseMalaysianIC("010229-10-5671");
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes("date")));
});

test("invalid month rejected", () => {
  const r = parseMalaysianIC("901301-10-5671");
  assert.equal(r.valid, false);
});

test("wrong length rejected", () => {
  const r = parseMalaysianIC("12345");
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes("12 digits")));
});

test("unassigned birthplace code rejected", () => {
  const r = parseMalaysianIC("900101-17-5671");
  assert.equal(r.valid, false);
  assert.equal(r.placeOfBirth.type, "unknown");
});

test("dashes and spaces are normalized", () => {
  assert.equal(normalizeIC(" 900101-10-5677 "), "900101105677");
  assert.equal(parseMalaysianIC("900101105677").valid, true);
});

test("isValidMalaysianIC convenience", () => {
  assert.equal(isValidMalaysianIC("900101-10-5677"), true);
  assert.equal(isValidMalaysianIC("abc"), false);
});
