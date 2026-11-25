// Malaysian IC (MyKad) birthplace codes — digits 7-8 (the "PB" pair).
// Source: Wikipedia "Malaysian identity card" (community-maintained, NOT an
// official JPN specification). type: state | country | region | special | na.
// `na` = code not assigned/used; treat as an invalid birthplace.

const state = (name) => ({ type: "state", name });
const country = (name) => ({ type: "country", name });
const region = (name) => ({ type: "region", name });
const special = (name) => ({ type: "special", name });
const NA = { type: "na", name: null };

// State / Federal Territory codes, including the overflow codes reused when a
// state's primary quota is exhausted.
const STATE_CODES = {
  Johor: ["01", "21", "22", "23", "24"],
  Kedah: ["02", "25", "26", "27"],
  Kelantan: ["03", "28", "29"],
  Malacca: ["04", "30"],
  "Negeri Sembilan": ["05", "31", "59"],
  Pahang: ["06", "32", "33"],
  Penang: ["07", "34", "35"],
  Perak: ["08", "36", "37", "38", "39"],
  Perlis: ["09", "40"],
  Selangor: ["10", "41", "42", "43", "44"],
  Terengganu: ["11", "45", "46"],
  Sabah: ["12", "47", "48", "49"],
  Sarawak: ["13", "50", "51", "52", "53"],
  "Kuala Lumpur": ["14", "54", "55", "56", "57"],
  Labuan: ["15", "58"],
  Putrajaya: ["16"],
};

export const BIRTHPLACE = {};
for (const [name, codes] of Object.entries(STATE_CODES)) {
  for (const code of codes) BIRTHPLACE[code] = state(name);
}

Object.assign(BIRTHPLACE, {
  // Specific foreign countries
  60: country("Brunei"),
  61: country("Indonesia"),
  62: country("Cambodia"),
  63: country("Laos"),
  64: country("Myanmar"),
  65: country("Philippines"),
  66: country("Singapore"),
  67: country("Thailand"),
  68: country("Vietnam"),
  74: country("China"),
  75: country("India"),
  76: country("Pakistan"),
  77: country("Saudi Arabia"),
  78: country("Sri Lanka"),
  79: country("Bangladesh"),
  // Special categories
  71: special("Born abroad before 2001"),
  72: special("Born abroad before 2001"),
  82: special("Unknown state"),
  98: special("Stateless"),
  99: special("Unspecified / refugee / other"),
  // Region groups (the code identifies a region, not one specific country)
  83: region("Asia-Pacific"),
  84: region("South America"),
  85: region("Africa"),
  86: region("Western Europe"),
  87: region("United Kingdom / Ireland"),
  88: region("Middle East"),
  89: region("East Asia"),
  90: region("Caribbean / Central America"),
  91: region("North America"),
  92: region("Eastern Europe"),
  93: region("Other"),
});

// Explicitly unassigned / not-in-use codes.
for (const code of ["00", "17", "18", "19", "20", "69", "70", "73", "80", "81", "94", "95", "96", "97"]) {
  BIRTHPLACE[code] = NA;
}
