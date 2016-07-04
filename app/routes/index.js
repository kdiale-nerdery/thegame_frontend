import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.RSVP.hash({
      items: this.get('store').findAll('item'),
      messages: this.get('store').findAll('message')
    });
  }
});
