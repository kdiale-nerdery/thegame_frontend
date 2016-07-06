import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  passiveItems: [
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
    this.schedulePointLoopTick();
    this.scheduleItemLoopTick();
  },

  pointLoop() {
    if (localStorage.getItem('apikey')) {
      this.retrieveInformation();
    } else {
      this.schedulePointLoopTick();
    }
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

  retrieveInformation() {
    this.secondsSinceLastItemUse();

    fetch(`${ENV.gameURL}/points`, {
      method: 'POST',
      headers: {
        apikey: localStorage.getItem('apikey')
      }
    }).then(response => {
      this.schedulePointLoopTick();

      if (response && response.ok) {
        response.json().then(this.processRequest.bind(this));
      }
    }).catch(() => {
      this.schedulePointLoopTick();
    });
  },

  automateItemUsage() {
    this.secondsSinceLastItemUse();

    if (localStorage.getItem('apikey') && (this.get('secondsSinceLastUse') > 1)) {
      this.retrieveItems().then(this.routeAutopilotMode.bind(this));
    } else {
    }

    this.scheduleItemLoopTick();
  },

  processRequest(json) {
    this.set('points', json.Points);
    this.set('effects', json.Effects.join(', '));

    if (json.Item) {
      let fields = json.Item.Fields[0];
      this.get('store').createRecord(
        'item',
        {
          uuid: fields.Id,
          name: fields.Name,
          rarity: fields.Rarity,
          description: fields.Description
        }
      ).save();
    }
  },

  schedulePointLoopTick() {
    Ember.run.later(this, this.pointLoop, 1000);
  },

  scheduleItemLoopTick() {
    Ember.run.later(this, this.automateItemUsage, 1000 * 61);
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

    for (let itemName of this.passiveItems) {
      boundFilter = this.itemFilter.bind(this, itemName);

      item = items.filter(boundFilter);

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

      item = items.filter(boundFilter);

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

        return true;
      }
    });

    if (validTargets) {
      item.use(validTargets[0].get('PlayerName'), false);
    }
  },

  itemFilter(name, item) {
    if (item.get('name') === name) {
      return true;
    }

    return false;
  },


  actions: {
    selectAutoPilotMode() {
      const index = this.$('select')[0].selectedIndex;
      const mode = this.get('autopilotOptions')[index];

      this.set('autopilotMode', mode.toLowerCase());
    }
  }
});
