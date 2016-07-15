import Ember from 'ember';
import ENV from '../config/environment';
import Item from '../models/item';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  ghosts: [
    'Power Pellet: Pinky',
    'Power Pellet: Clyde',
    'Power Pellet: Inky',
    'Power Pellet: Binky'
  ],

  init() {
    this._super(...arguments);
    this.schedulePointLoopTick();
  },

  pointLoop() {
    this.secondsSinceLastItemUse();

    if (this.get('stopPointLoop')) {
      this.schedulePointLoopTick();
      return;
    }

    if (this.mayRetrievePoints()) {
      this.retrieveInformation();
    } else {
      this.schedulePointLoopTick();
    }
  },

  mayRetrievePoints() {
    let key = localStorage.getItem('apikey');

    let badges = localStorage.getItem('badges');
    let allGhosts;

    if (badges) {
      badges = badges.split(', ');

      let filteredBadges = badges.filter(badge => {
        return this.ghosts.indexOf(badge) !== -1;
      });

      allGhosts = filteredBadges.length === 4;
    } else {
      allGhosts = false;
    }

    let date = (new Date()).toISOString().split('T')[0];
    let dateString = `pointsRetrievedOn:${date}`;
    let pointsRetrievedOnDate = parseInt(localStorage.getItem(dateString));
    
    if (!pointsRetrievedOnDate) {
      pointsRetrievedOnDate = 0;
    }

    return Boolean(key) && ((pointsRetrievedOnDate < 50000) || allGhosts);
  },

  secondsSinceLastItemUse() {
    this.set('secondsSinceLastUse', Item.secondsSinceLastItemUse());
  },

  processRequest(json) {
    this.set('points', json.Points);
    localStorage.setItem('effects', json.Effects.join(', '));
    this.set('effects', json.Effects.join(', '));

    let badges = json.Badges.map(badge => {
      return badge.BadgeName;
    });

    localStorage.setItem('badges', badges.join(', '));
    this.set('badges', badges.join(', '));

    let date = (new Date()).toISOString().split('T')[0];
    let dateString = `pointsRetrievedOn:${date}`;
    let pointsRetrievedOnDate = parseInt(localStorage.getItem(dateString));

    if (!pointsRetrievedOnDate) {
      localStorage.setItem(dateString, 0);
      pointsRetrievedOnDate = 0;
    }

    localStorage.setItem(dateString, ++pointsRetrievedOnDate);


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

  retrieveInformation() {
    if (!localStorage.getItem('you')) {
      fetch(`${ENV.gameURL}/points`, {
        method: 'get',
        headers: {
          apikey: localStorage.getItem('apikey')
        }
      }).then(response => {
        if (response && response.ok) {
          return response.json();
        }
      }).then(json => {
        localStorage.setItem('you', json.Fields[0].PlayerName);
      });
    }

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

  schedulePointLoopTick() {
    Ember.run.later(this, this.pointLoop, 1000);
  }
});
