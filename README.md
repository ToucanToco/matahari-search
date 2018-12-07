# MataHari-search

Toucan Toco's Confluence indexing script for Algolia


![](matahari.png)
> She knows if you're Writing The F*ing Manual.
> She's been secretly documenting your documentation.


## Install it

> Get your spy gear

### Dependencies

> You must have node and yarn installed

```bash
# To install dependencies run
$ yarn
or
$ npm install
```

### Login info

TODO use a secret etc

* Get the Confluence login/password for the special Confluence for Algolia user (in LastPass)
```
cp confluence-ids.js.dist confluence-ids.js
```
and fill the info

* Get the API Key and App ID for Algolia (logins are in LastPass)
```
cp algolia-ids.js.dist algolia-ids.js
```
and fill the info


## Index Confluence pages

> More spying.

Run `yarn start` to sync all of Confluence's pages into Algolia.
This takes 5-10minutes.

## Search the doc!

> Big Sister is watching you

Get the search only API Key and App ID for Algolia (logins are in LastPass)
```
cp index.html.dist index.html
```
and fill the info

To test the results, open `index.html` in a browser.
