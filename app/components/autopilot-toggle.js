import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  passiveItems: [
    'Moogle',
    'Warthog',
    'Rush the Dog',
    '7777',
    'Buffalo',
    'Biggs',
    'Wedge',
    'Pizza',
    'Pokeball',
    'Da Da Da Da Daaa Da DAA da da',
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
    'Tanooki Suit',
    'Carbuncle',
    'Star'
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
    Ember.run.later(this, this.automateItemUsage, 1000);
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
      this.get('store').findAll('leaderboard', {reload: true}).then(this.selectTarget.bind(this, item[0]));
    }
  },

  selectTarget(item, leaderboard) {
    let validTargets = leaderboard.toArray().filter(player => {
      let effects = player.get('Effects');

      for (let invulnEffect of this.invulnerabilityEffects) {
        if (effects.indexOf(invulnEffect) !== -1) {
          return false;
        }

        if (effects.indexOf(item.get('name')) !== -1) {
          return false;
        }

        if (localStorage.getItem('you') === player.get('PlayerName')) {
          return false;
        }

        return true;
      }
    });

    if (validTargets) {
      console.log('Attempting to use ' + item.get('name'));
      item.use(validTargets[0].get('PlayerName'), false);
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
    const lastItemUseRaw = localStorage.getItem('lastItemUse');
    const lastItemUse = new Date(Date.parse(lastItemUseRaw));

    if (lastItemUse) {
      let now = new Date();
      let differenceInSeconds = (now - lastItemUse) / 1000;

      this.set('secondsSinceLastUse', Math.round(differenceInSeconds));
    }
  },

  automateItemUsage() {
    this.secondsSinceLastItemUse();

    if (localStorage.getItem('apikey') && (this.get('secondsSinceLastUse') > 61)) {
      this.retrieveItems().then(this.routeAutopilotMode.bind(this));
    } else {
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
