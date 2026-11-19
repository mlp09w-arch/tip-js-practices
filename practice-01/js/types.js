"use strict";

const sumWithString = "8" + 2;
const subtraction = "8" - 2;
const numericSum = Number("8") + 2;
const stringComparison = "12" > "3";
const strictComparison = 12 === "12";
const emptyStringNumber = Number("");
const invalidNumber = Number("text");
const nonEmptyString = Boolean("false");
const nullType = typeof null;
const nanType = typeof NaN;

console.log('"8" + 2:', sumWithString, typeof sumWithString);
console.log('"8" - 2:', subtraction, typeof subtraction);
console.log('Number("8") + 2:', numericSum, typeof numericSum);
console.log('"12" > "3":', stringComparison, typeof stringComparison);
console.log('12 === "12":', strictComparison, typeof strictComparison);
console.log('Number(""):', emptyStringNumber, typeof emptyStringNumber);
console.log('Number("text"):', invalidNumber, typeof invalidNumber);
console.log('Boolean("false"):', nonEmptyString, typeof nonEmptyString);
console.log('typeof null:', nullType, typeof nullType);
console.log('typeof NaN:', nanType, typeof nanType);
