import Ember from 'ember';
import Item from '../models/item';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  tagName: 'tr',

  actions: {
    use() {
      if (!Item.mayUseItem()) {
        this.get('store').createRecord(
          'message',
          {
            content: 'Too early to use an item! You may only use an item every 60 seconds.'
          }
        ).save();

        return;
      }

      const target = prompt('Who would you like to target?');

      if (!target && target !== '') {
        return;
      }

      const item = this.get('item').items[0];

      item.use(target);
    },

    toss() {
      const tossConfirm = confirm(
        'Are you sure you would like to toss this item?');

      if (tossConfirm) {
        let groupedItem = this.get('item');
        let item = groupedItem.items[0];

        item.deleteRecord();
        item.save();
      }
    }
  },

  processRequest(json) {
    for (let message of json.Messages) {
      this.get('store').createRecord(
        'message',
        {
          content: message
        }
      ).save();
    }

    let groupedItem = this.get('item');
    let item = groupedItem.items[0];

    item.deleteRecord();
    item.save();
  }
});
