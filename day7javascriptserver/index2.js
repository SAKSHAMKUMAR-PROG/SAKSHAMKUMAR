const express = require("express");
const news = require("./Dataset/news2");

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to news website");
});

// app.get("/news2", (req, res) => {
//   res.json(news);
// });

app.get("/news2/:id", (req, res) => {
  const id = req.params.id;
  for (let n = 0; n < news.length; n++) {
    if (news[n].id == id) {
      return res.json(news[n].news);
    }
  }
  return res.json({ status: "not found" });
});

// app.get("/news2", (req, res) => {
//   const limit = req.query.limit;
//   let result = news;

//   if (limit) {
//     result = result.slice(0, limit);
//   }
//   res.json(result);
// });

app.get("/news2", (req, res) => {
  const limit = req.query.limit;
  const category = req.query.category;
  if (limit) {
    return res.json(news.slice(0, limit));
  } else if (category) {
    const finalnews = [];
    for (let i = 0; i < news.length; i++) {
      if (news[i].category.toLowerCase() === category.toLowerCase()) {
        finalnews.push(news[i]);
      }
    }
    return res.json(finalnews);
  } else {
    return res.json(news);
  }
});

// app.get("/news2", (req, res) => {
//   const category = req.query.category;
//   const limit = req.query.limit;

//   let result = news;

//   if (category) {
//     result = result.filter((i) => i.category === category);
//   }
//   if (limit) {
//     result = result.slice(0, Number(limit));
//   }
//   res.json(result);
// });

app.get("/news2", (req, res) => {
  const limit = Number(req.query.limit);
  const from = req.query.from;
  let result = news;

  if (limit) {
    if (from === "bottom") {
      result = result.slice(-limit);
    } else {
      result = result.slice(0, limit);
    }
  }

  res.json(result);
});

app.listen(3000, () => {
  console.log("Server running on localhost:3000");
});
