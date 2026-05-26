// const age = 21;
// console.log(age);
// age = 23;
// console.log(age);

const iseven = require("./module/iseven");
iseven(23);

const isodd = require("./module/isodd");
isodd(24);

const isprime = require("./module/isprime");
isprime(25);

const http = require("http");

const server = http.createServer((req, res) => {
  res.write("hello world");
  res.end();
});
server.listen(3000, () => {
  console.log("server is running on port 3000");
});
