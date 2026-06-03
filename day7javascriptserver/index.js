const express = require("express");
const news = require("./dataset/news2");
const prisma = require("./src/config/prisma");
const { searchByTerm, searchByCategory } = require("./module/utils");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.send(" Welcome to Our News Website");
});

app.get("/db-check", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: "connected" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return res.json(users);
});

app.post("/users", async (req, res) => {
  const { name, email, roll_no } = req.body;

  if (!name || !email || !roll_no) {
    return res
      .status(400)
      .json({ message: "name, email, and roll_no are required" });
  }

  const user = await prisma.user.create({
    data: { name, email, roll_no },
  });

  return res.status(201).json(user);
});

app.get("/news2", (req, res) => {
  const { search, category, limit } = req.query;
  let filternews = news;
  if (search) {
    filternews = searchByTerm(search, news);
  }
  if (category) {
    filternews = searchByCategory(category, filternews);
  }
  if (limit) {
    filternews = filternews.slice(0, limit);
  }
  if (filternews.length > 0) {
    return res.send(filternews);
  } else {
    return res.send("News Not Found, please try some different filters");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
