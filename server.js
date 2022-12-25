const express = require("express");
const app = express();
const { getSynonyms, getData } = require("./api.js");

app.get("/", function (req, res) {
  res.send("hello");
});
app.get("/api", function (req, res) {
  res.send("hello");
});
app.get("/api/synonym/:word", function (req, res) {
  const word = req.params.word;
  console.log(word);
  getSynonyms(word).then((data) => res.send(data));
});

app.get("/api/:word", function (req, res) {
  const word = req.params.word;
  const lang = req.query.lang;
  getData(word, lang).then(function (obj) {
    res.send(obj);
  });
});

app.listen(8080, (_) => {
  console.log("server started on port 8080");
});
