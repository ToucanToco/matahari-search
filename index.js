const algoliasearch = require('algoliasearch');
const { confluenceGet, parseDocuments } = require('./helpers.js');
const algoliaIds = require('./algolia-ids');

const client = algoliasearch(algoliaIds.appId, algoliaIds.apiKey);
const index = client.initIndex('confluence');
// Confluence index settings
index.setSettings({ attributeForDistinct: 'name' });

// Index all confluence by chunk
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

/*

// For now this code doesnt work properly because it seems the records arent ordered properly.
// Leaving this here because it has corrections from the Algolia doc which has mistakes.

const run = (from = 0) => {
  const saveObjects = (link = '/rest/api/content') => {
    let lastUpdatedAt = 0;
    return confluenceGet(link)
      .then(json => {
        let records = parseDocuments(json.results);
        index.saveObjects(records)
        .then(res => {
          lastUpdatedAt = new Date(
            records[records.length - 1].lastUpdatedAt
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
*/
