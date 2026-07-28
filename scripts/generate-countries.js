const fs = require('fs');
const countries = require('world-countries');

// Top economies / high-traffic to put first (by CCA2)
const topCca2 = ["IL", "US", "GB", "CA", "DE", "FR", "AU", "IN", "AE"];

// Format country objects
const formattedCountries = countries.map(c => {
  // some countries don't have an idd root (like Antarctica sometimes)
  const root = c.idd.root || "";
  const suffix = (c.idd.suffixes && c.idd.suffixes.length === 1) ? c.idd.suffixes[0] : "";
  const code = (root + suffix).replace('+', '');
  
  return {
    cca2: c.cca2,
    name: c.name.common,
    flag: c.flag,
    code: code
  };
}).filter(c => c.code !== "");

// Sort alphabetically first
formattedCountries.sort((a, b) => a.name.localeCompare(b.name));

// Separate top from rest
const topCountries = [];
topCca2.forEach(cca2 => {
  const found = formattedCountries.find(c => c.cca2 === cca2);
  if (found) topCountries.push(found);
});

const restCountries = formattedCountries.filter(c => !topCca2.includes(c.cca2));

// Combine
const finalCountries = [...topCountries, ...restCountries];

const fileContent = `export interface Country {
  cca2: string;
  name: string;
  flag: string;
  code: string;
}

export const COUNTRIES: Country[] = ${JSON.stringify(finalCountries, null, 2)};
`;

fs.writeFileSync('./lib/countries.ts', fileContent);
console.log('Successfully generated lib/countries.ts with ' + finalCountries.length + ' countries.');
