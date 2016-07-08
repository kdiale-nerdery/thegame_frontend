import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  host: 'http://thegame.nerderylabs.com:1337',
  headers: {
    accept: 'application/json'
  }
});
