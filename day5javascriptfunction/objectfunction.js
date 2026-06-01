function findTM(no1, no2, no3) {
  return no1 + no2 + no3;
}
const a = {
  marks: { English: 76, Math: 89, Science: 78 },
  name: "SAKSHAM",
  roll: 53,
  class: "x",
  findTotalM: findTM,
};
const sum = a.findTotalM(a.marks.English, a.marks.Math, a.marks.Science);
console.log(sum);
