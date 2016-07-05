import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Component.extend({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.schedulePointLoopTick();
  },

  pointLoop() {
    if (localStorage.getItem('apikey')) {
      this.retrieveInformation();
    } else {
      this.schedulePointLoopTick();
    }
  },

  retrieveInformation() {
    const lastItemUseRaw = localStorage.getItem('lastItemUse');
    const lastItemUse = new Date(Date.parse(lastItemUseRaw));

    if (lastItemUse) {
      let now = new Date();
      let differenceInSeconds = (now - lastItemUse) / 1000;

      this.set('secondsSinceLastUse', Math.round(differenceInSeconds));
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
    Ember.run.later(this, this.pointLoop, 1100);
  }
});
