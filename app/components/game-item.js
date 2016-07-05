import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  tagName: 'tr',

  actions: {
    use() {
      const lastItemUseRaw = localStorage.getItem('lastItemUse');
      const lastItemUse = new Date(Date.parse(lastItemUseRaw));

      if (lastItemUse) {
        let now = new Date();
        let differenceInSeconds = (now - lastItemUse) / 1000;

        if (differenceInSeconds < 60) {
          this.get('store').createRecord(
            'message',
            {
              content: 'Too use to use an item!'
            }
          ).save();

          return;
        }
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
    let item = groupedItem.items.pop();

    item.deleteRecord();
    item.save();
  }
});
