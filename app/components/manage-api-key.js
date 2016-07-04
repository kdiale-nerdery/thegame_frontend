import Ember from 'ember';

export default Ember.Component.extend({
  willRender() {
    this.set('key', localStorage.getItem('apikey'));
  },

  actions: {
    set() {
      localStorage.setItem('apikey', this.get('key'));
    },

    reset() {
      localStorage.removeItem('apikey');
    }
  }
});
