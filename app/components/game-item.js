import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Component.extend({
  tagName: 'tr',

  actions: {
    use() {
      const target = prompt('Who would you like to target?');
      const item = this.get('item');

      if (!target) {
        const url = `${ENV.gameURL}/items/use/${item.uuid}`;
      } else {
        const url = `${ENV.gameURL}/items/use/${item.uuid}?target=${target}`;
      }

      /*
      item.deleteRecord();
      item.save();
       */
    },

    toss() {
      const tossConfirm = confirm(
        'Are you sure you would like to toss this item?');

      if (tossConfirm) {
        let item = this.get('item');
        item.deleteRecord();
        item.save();
      }
    }
  }
});
