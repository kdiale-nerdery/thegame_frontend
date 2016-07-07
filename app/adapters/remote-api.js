import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  host: 'http://thegame.nerderylabs.com',
  headers: {
    accept: 'application/json'
  }
});
