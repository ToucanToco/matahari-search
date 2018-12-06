const rp = require('request-promise-native');
const striptags = require('striptags');

// TODO shipping of this :)
const confluenceIds = require('./confluence-ids');

const buildURL = uri =>
  uri ? confluenceIds.host + uri.replace(/^\/wiki/, '') : false;

const parseContent = html =>
  html
    ? striptags(html)
        .replace(/(\r\n?)+/g, ' ')
        .replace(/\s+/g, ' ')
    : '';

module.exports = {
  confluenceGet(uri) {
    return rp({
      url: confluenceIds.host + uri,
      // GET parameters
      qs: {
        limit: 20, // number of item per page
        orderBy: 'history.lastUpdated', // sort them by last updated
        expand: [
          // fields to retrieve
          'history.lastUpdated',
          'ancestors.page',
          'descendants.page',
          'body.view',
          'space'
        ].join(',')
      },
      headers: {
        // auth headers
        Authorization: `Basic ${Buffer.from(
          `${confluenceIds.username}:${confluenceIds.password}`
        ).toString('base64')}`
      },
      json: true
    });
  },
  parseDocuments(documents) {
    return documents.map(doc => {
      const record = {
        objectID: doc.id,
        name: doc.title,
        url: buildURL(doc._links.webui),
        space: doc.space.name,
        spaceMeta: {
          id: doc.space.id,
          key: doc.space.key,
          url: buildURL(doc.space._links.webui)
        },
        lastUpdatedAt: doc.history.lastUpdated.when,
        lastUpdatedBy: doc.history.lastUpdated.by.displayName,
        lastUpdatedByPicture: buildURL(
          doc.history.lastUpdated.by.profilePicture.path.replace(
            /(\?[^\?]*)?$/,
            '?s=200'
          )
        ),
        createdAt: doc.history.createdDate,
        createdBy: doc.history.createdBy.displayName,
        createdByPicture: buildURL(
          doc.history.createdBy.profilePicture.path.replace(
            /(\?[^\?]*)?$/,
            '?s=200'
          )
        ),
        path: doc.ancestors.map(item => item.title).join(' › '),
        level: doc.ancestors.length,
        ancestors: doc.ancestors.map(item => ({
          id: item.id,
          name: item.title,
          url: buildURL(item._links.webui)
        })),
        children: doc.descendants
          ? doc.descendants.page.results.map(item => ({
              id: item.id,
              name: item.title,
              url: buildURL(item._links.webui)
            }))
          : [],
        content: null
      };
      let content = parseContent(doc.body.view.value);
      while (content.length) {
        // extract the first 600 characters (without splitting words)
        const chunk = content.replace(/^(.{600}[^\s]*).*/, '$1');
        // remove chunk from the original content
        content = content.substring(chunk.length);
        // inject the content chunk into a copy of the initial record
        return Object.assign({}, record, { content: chunk });
      }
    });
  }
};
