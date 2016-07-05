import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'table',
  classNames: ['table', 'table-hover'],

  groupedItems: Ember.computed('items.@each', function() {
    let groupedItems = {};

    this.get('items').map(this.mapItems.bind(this, groupedItems));

    let groupedItemsArray = [];
    for (let k in groupedItems) {
      if (groupedItems.hasOwnProperty(k)) {
        groupedItemsArray.push(groupedItems[k]);
      }
    }

    groupedItemsArray.sort(function(a, b) {
      if (a.name > b.name) {
        return 1;
      }

      return -1;
    });

    return groupedItemsArray;
  }),

  itemsDidChange() {
    console.log('what is up');
    this.send('groupedItemsChanged');
  },

  mapItems(groupedItems, item) {
    const itemName = item.get('name');

    if (groupedItems[itemName]) {
      groupedItems[itemName].quantity++;
      groupedItems[itemName].items.push(item);
    } else {
      groupedItems[itemName] = {};
      groupedItems[itemName].quantity = 1;
      groupedItems[itemName].name = itemName;
      groupedItems[itemName].description = item.get('description');
      groupedItems[itemName].rarity = item.get('rarity');
      groupedItems[itemName].items = [];
      groupedItems[itemName].items.push(item);
    }

    return item;
  }
});
