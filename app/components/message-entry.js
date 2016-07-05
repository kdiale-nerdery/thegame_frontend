import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    remove() {
      const message = this.get('message');

      message.deleteRecord();
      message.save();
    }
  }
});
