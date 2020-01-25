const axios = require('axios').default;
const path = require('path');
const { mkdirSync, existsSync, writeFileSync } = require('fs');

async function query(keyword, name) {
  console.log('start', name);

  const res = await axios.post(
    'https://lua9b20g37-3.algolianet.com/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%20(lite)%203.30.0%3Breact-instantsearch%205.2.3%3BJS%20Helper%202.26.1&x-algolia-application-id=LUA9B20G37&x-algolia-api-key=dcc55281ffd7ba6f24c3a9b18288499b',
    {
      requests: [
        {
          indexName: 'prod_all_products_term_optimization_v2',
          params: `query=${keyword}&hitsPerPage=10&maxValuesPerFacet=1000&page=0&clickAnalytics=true&ruleContexts=["en"]&facets=["allLanguages","productDifficultyLevel","skills","partners","entityTypeDescription"]&tagFilters=&facetFilters=[["entityTypeDescription:Courses"],["allLanguages:Chinese (China)","allLanguages:English"]]`,
        },
        {
          indexName: 'prod_all_products_term_optimization_v2',
          params: `query=${keyword}&hitsPerPage=10&maxValuesPerFacet=1000&page=1&clickAnalytics=true&ruleContexts=["en"]&facets=["allLanguages","productDifficultyLevel","skills","partners","entityTypeDescription"]&tagFilters=&facetFilters=[["entityTypeDescription:Courses"],["allLanguages:Chinese (China)","allLanguages:English"]]`,
        },
      ],
    },
  );
  console.log('get result');

  const courses = res.data.results
    .map(r => r.hits)
    .reduce((pre, cur) => pre.concat(cur), []);
  console.log('get serialized result');

  const curDir = path.resolve(__dirname, 'results', 'coursera', name);
  if (!existsSync(curDir)) {
    mkdirSync(curDir, { recursive: true });
  }
  const filename = path.resolve(curDir, `result.json`);
  writeFileSync(filename, JSON.stringify(courses, null, '  '));
  console.log('finish', name);
  console.log();
}

(async () => {
  await Promise.all(
    [
      ['algorithm', 'algorithm'],
      ['nlp', 'nlp'],
      ['computer vision', 'cv'],
      ['probability', 'probability'],
      ['machine learning', 'machine-learning'],
      ['deep learning', 'deep-learning'],
    ].map(([key, name]) => query(key, name)),
  );
})();
