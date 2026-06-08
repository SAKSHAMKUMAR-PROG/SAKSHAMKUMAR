const express = require("express");
const news = require("./dataset/news2");
const prisma = require("./src/config/prisma");
const { searchByTerm, searchByCategory } = require("./module/utils");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.send(" Welcome to Our LegalLens Website");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
