const express = require("express");
const newsdata = require("./DATA SET/news");

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to News Website");
});

app.get("/news/:id", (req, res) => {
  const id = Number(req.params.id);

  const news = newsdata.find((item) => item.id === id);

  if (news) {
    return res.status(200).json(news);
  }

  return res.status(404).json({
    message: "News not found",
  });
});

app.get("/news", (req, res) => {
  let result = [...newsdata];

  if (req.query.category) {
    result = result.filter(
      (item) =>
        item.category.toLowerCase() === req.query.category.toLowerCase(),
    );
  }

  if (req.query.limit) {
    const limit = Number(req.query.limit);
    result = result.slice(0, limit);
  }

  return res.status(200).json(result);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
