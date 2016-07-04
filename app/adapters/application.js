import IndexedDBAdapter from 'ember-indexeddb-adapter/adapters/indexeddb';
 
export default IndexedDBAdapter.extend({
  dbName: 'thegame',

  version: 2,
 
  models: ['item', 'message']
});
