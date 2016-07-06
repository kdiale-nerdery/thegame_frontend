import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    this._super(...arguments);

    this.set('username', localStorage.getItem('you'));
  },

  actions: {
    set() {
      localStorage.setItem('you', this.get('username'));
    }
  }
});
