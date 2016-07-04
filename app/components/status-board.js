import Ember from 'ember';
import ENV from '../config/environment';

export default Ember.Component.extend({
  store: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.scheduleLoopTick();
  },

  pointLoop() {
    if (localStorage.getItem('apikey')) {
      this.retrieveInformation();
    } else {
      this.scheduleLoopTick();
    }
  },

  retrieveInformation() {
    fetch(`${ENV.gameURL}/points`, {
      method: 'POST',
      headers: {
        apikey: localStorage.getItem('apikey')
      }
    }).then(response => {
      this.scheduleLoopTick();

      if (response && response.ok) {
        response.json().then(this.processRequest.bind(this));
      }
    }).catch(() => {
      this.scheduleLoopTick();
    });
  },

  processRequest(json) {
    console.log(json);

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

  scheduleLoopTick() {
    Ember.run.later(this, this.pointLoop, 1100);
  }
});
