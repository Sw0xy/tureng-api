const cheerio = require("cheerio");
const { gotScraping } = require("got-scraping");

let result = {
  word: null,
  success: true,
  meanings: [],
  languages: null,
  voices: [],
  suggestions: [],
};
let synonms = [];

const getSynonyms = async (word) => {
  const synonym = encodeURI(word);
  synonms = [];
  const response = await gotScraping({
    url: `https://tureng.com/en/english-synonym/${synonym}`,
    headerGeneratorOptions: {
      browsers: [
        {
          name: "chrome",
          minVersion: 87,
          maxVersion: 89,
        },
      ],
      devices: ["desktop"],
      locales: ["de-DE"],
      operatingSystems: ["windows", "linux"],
    },
  });
  let $ = cheerio.load(response.body);
  $(".synonym-results")
    .find("table > tbody")
    .eq(0)
    .find("tr")
    .each((i, el) => {
      const partOfSpeech = $(el).children().first().text().trim();
      $(el)
        .find("td:nth-child(2) table tbody tr")
        .each((i, el) => {
          const part = $(el).children().first().text().trim();
          $(el)
            .find("td:nth-child(2) a")
            .each((i, el) => {
              const wordss = $(el).text().trim();
              return synonms.push({
                synonym: wordss,
                number: part,
                partOfSpeech,
              });
            });
        });
    });
  return synonms;
};
const getData = async (word, lang) => {
  lang = encodeURI(lang);
  result.languages = decodeURI(lang);
  word = encodeURI(word);
  result.word = decodeURI(word);
  result.meanings = [];
  result.voices = [];
  result.suggestions = [];
  const response = await gotScraping({
    url: `https://tureng.com/en/${lang}/${word}`,
    headerGeneratorOptions: {
      browsers: [
        {
          name: "chrome",
          minVersion: 87,
          maxVersion: 89,
        },
      ],
      devices: ["desktop"],
      locales: ["de-DE"],
      operatingSystems: ["windows", "linux"],
    },
  });
  const langsArray = [
    { languages: "turkish-english", flang: "tr" },
    { languages: "french-english", flang: "fr" },
    { languages: "german-english", flang: "de" },
    { languages: "spanish-english", flang: "es" },
  ];
  let ls = null;
  langsArray.forEach((item) => {
    if (lang === item.languages) {
      ls = item.flang;
    }
  });

  return fetchData(response.body, word, ls);
};

function fetchData(response, word, flang) {
  let $ = cheerio.load(response);

  $(".flagsDiv")
    .find(".tureng-voice")
    .each(function (i, el) {
      const results = $(el).find("audio > source").attr("src");
      const accent = $(el).find("div").attr("data-accent").slice(6);
      return result.voices.push({
        src: results,
        accent: accent,
      });
    });
  $("ul.suggestion-list")
    .find("li")
    .each(function (i, el) {
      const text = $(el).text().trim();
      const link = $(el).find("a").attr("href");
      const turengURL = "https://www.tureng.com";
      return result.suggestions.push({
        text: text,
        link: turengURL + link,
      });
    });
  $("table.searchResultsTable")
    .eq(0)
    .find("tr")
    .each(function (i, el) {
      let gen = $(el).find("td:nth-child(2)").text().trim();
      let enItem = $(el).find("td[lang=en] > a").text().trim();
      const partOfSpeech = $(el).find(`td[lang=${flang}] > i`).text().trim();
      if (enItem == word) {
        let item = $(el).find(`td[lang=${flang}] > a`);
        let meaning = item.text().trim();

        if (meaning.length > 1) {
          result.meanings.push({
            usage: gen,
            meaning: meaning,
            partOfSpeech,
          });
        }
        return;
      }

      let item = $(el).find("td[lang=en] > a");

      let meaning = item.text().trim();
      if (meaning.length > 1) {
        result.meanings.push({
          usage: gen,
          meaning: meaning,
          partOfSpeech,
        });
      }
    });

  if ($("table.searchResultsTable").length === 0) {
    result.meanings.push("No result found");
    result.success = false;
  }

  return result;
}
module.exports = {
  getData,
  getSynonyms,
};
