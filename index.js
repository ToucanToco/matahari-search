const algoliasearch = require('algoliasearch');
const { confluenceGet, parseDocuments } = require('./helpers.js');
const algoliaIds = require('./algolia-ids');

const client = algoliasearch(algoliaIds.appId, algoliaIds.apiKey);
const index = client.initIndex('confluence');
// Confluence index settings
index.setSettings({ attributeForDistinct: 'name' });

const run = () => {
  const saveObjects = (link = '/rest/api/content') => {
    return confluenceGet(link).then(json => {
      index.saveObjects(parseDocuments(json.results)).then(res => {
        if (json._links.next) saveObjects(json._links.next);
      });
    });
  };
  saveObjects();
};

run();
