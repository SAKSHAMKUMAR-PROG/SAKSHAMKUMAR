const news = require("./dataset/news2");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to your news website");
});

//app.get("/news2", (req, res) => {
// res.send(news);
//});

app.get("/news2/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  for (let n = 0; n < news.length; n++) {
    if (news[n].id == id) {
      console.log("matched");
      return res.json(news[n].headline);
    }
  }
  return res.json({ status: "not found" });
});

//app.get("/news2", (req, res) => {
//const limit = req.query.limit;
//let result = news;
//if (limit) {
//result = result.slice(0, limit);
//}
//res.send(result);
//});

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

app.listen(3000, () => {
  console.log("Server running on localhost:3000");
});
