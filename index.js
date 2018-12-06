const algoliasearch = require('algoliasearch');
const { confluenceGet, parseDocuments } = require('./helpers.js');
const algoliaIds = require('./algolia-ids');

const client = algoliasearch(algoliaIds.appId, algoliaIds.apiKey);
const index = client.initIndex('confluence');
// Confluence index settings
index.setSettings({ attributeForDistinct: 'name' });

const run = (from = 0) => {
  const saveObjects = (link = '/rest/api/content') => {
    let lastUpdatedAt = 0;
    return confluenceGet(link)
      .then(json => {
        let documents = json.results;
        index.saveObjects(parseDocuments(documents))
        .then(res => {

          lastUpdatedAt = new Date(
            documents[documents.length - 1].lastUpdatedAt
          ).getTime();
          if (json._links.next && lastUpdatedAt >= from)
            saveObjects(json._links.next);
        });
      });
  };
  saveObjects();
};

const args = process.argv.slice(2);
const from = args.length
  ? new Date(args[0]).getTime()
  : Date.now() - 10 * 60 * 1000;

run(from);
