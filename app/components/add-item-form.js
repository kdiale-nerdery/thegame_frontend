import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  classNames: ['item-form'],

  actions: {
    create() {
      let properties = this.getProperties('uuid', 'name', 'rarity');

      properties.description = 'Manually Added';

      this.get('store').createRecord(
        'item',
        properties
      ).save();

      this.setProperties({
        uuid: '',
        name: '',
        rarity: ''
      });
    }
  }
});
