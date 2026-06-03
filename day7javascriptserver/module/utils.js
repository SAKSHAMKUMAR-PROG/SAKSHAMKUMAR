function searchByTerm(term, news) {
  const filteredNews = [];
  for (let i = 0; i < news.length; i++) {
    if (news[i].headline.toLowerCase().includes(term.toLowerCase())) {
      filteredNews.push(news[i]);
    }
  }
  return filteredNews;
}

function searchByCategory(category, news) {
  const filteredNews = [];
  for (let i = 0; i < news.length; i++) {
    console.log(news[i].category, category);
    if (news[i].category.toLowerCase() === category.toLowerCase()) {
      filteredNews.push(news[i]);
    }
  }
  return filteredNews;
}

module.exports = {
  searchByTerm,
  searchByCategory,
};

