import Ember from 'ember';
import ENV from '../config/environment';
import Item from '../models/item';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  passiveItems: [
    'Moogle',
    'Warthog',
    'Rush the Dog',
    '7777',
    'Buffalo',
    'Pokeball',
    'Da Da Da Da Daaa Da DAA da da',
    'Biggs',
    'Wedge',
    'Pizza',
    'UUDDLRLRBA',
    'Bo Jackson'
  ],

  offensiveItems: [
    'Charizard',
    'Buster Sword',
    'Crowbar',
    'Hard Knuckle',
    'Holy Water',
    'Red Shell',
    'Green Shell',
    'Banana Peel',
    'Fire Flower',
    'Hadouken'
  ],

  invulnerabilityEffects: [
    'Gold Ring',
    'Star',
    'Tanooki Suit',
    'Morger\'s Beard'
  ],

  init() {
    this._super(...arguments);
    this.set('autopilotOptions', [
      'Off',
      'Passive',
      'Offensive'
    ]);

    this.set('autopilotMode', 'off');

    this.scheduleItemLoopTick();
  },

  scheduleItemLoopTick() {
    Ember.run.later(this, this.automateItemUsage, 1000 * 5);
  },

  retrieveItems() {
    return this.get('store').findAll('item');
  },

  routeAutopilotMode(items) {
    switch(this.get('autopilotMode')) {
      case 'passive':
        this.decidePassiveItem(items);
        break;
      case 'offensive':
        this.decideOffensiveItem(items);
        break;
    }
  },

  decideFullyAutomatedItem(items) {
    console.log("I'm deciding the automation!");
  },

  decidePassiveItem(items){
    let boundFilter;
    let item;

    let filteredPassiveItems = this.passiveItems.filter(this.defensiveFilter);

    for (let itemName of filteredPassiveItems) {
      boundFilter = this.itemFilter.bind(this, itemName);

      item = items.toArray().filter(boundFilter);

      if (item.length > 0) {
        break;
      }
    }

    if (item.length > 0) {
      console.log('Attempting to use ' + item[0].get('name'));
      item[0].use(undefined, false);
    }
  },

  decideOffensiveItem(items){
    let boundFilter;
    let item;

    for (let itemName of this.offensiveItems) {
      boundFilter = this.itemFilter.bind(this, itemName);

      item = items.toArray().filter(boundFilter);

      if (item.length > 0) {
        break;
      }
    }

    if (item.length > 0) {
      fetch(`${ENV.gameURL}/`, {
        method: 'get',
        headers: {
          accept: 'application/json'
        }
      }).then(response => {
        return response.json();
      }).then(this.selectTarget.bind(this, item[0]));
    }
  },

  selectTarget(item, leaderboard) {
    let validTargets = leaderboard.filter(player => {
      let effects = player.Effects;

      for (let invulnEffect of this.invulnerabilityEffects) {
        if (effects.indexOf(invulnEffect) !== -1) {
          return false;
        }

        if (effects.indexOf(item.get('name')) !== -1) {
          return false;
        }

        if (localStorage.getItem('you') === player.PlayerName) {
          return false;
        }

        return true;
      }
    });

    if (validTargets) {
      console.log('Selecting target ' + validTargets[0].PlayerName);
      console.log('Attempting to use ' + item.get('name'));
      item.use(validTargets[0].PlayerName, false);
    }
  },

  defensiveFilter(item) {
    let effects = localStorage.getItem('effects').split(', ');

    if (effects.indexOf(item) !== -1) {
      return false;
    }

    return true;
  },

  itemFilter(name, item) {
    if (item.get('name') === name) {
      return true;
    }

    return false;
  },

  secondsSinceLastItemUse() {
    this.set('secondsSinceLastUse', Item.secondsSinceLastItemUse());
  },

  automateItemUsage() {
    this.secondsSinceLastItemUse();

    if (localStorage.getItem('apikey') && Item.mayUseItem()) {
      this.retrieveItems().then(this.routeAutopilotMode.bind(this));
    }

    this.scheduleItemLoopTick();
  },

  actions: {
    selectAutoPilotMode() {
      const index = this.$('select')[0].selectedIndex;
      const mode = this.get('autopilotOptions')[index];

      this.set('autopilotMode', mode.toLowerCase());
    }
  }
});
