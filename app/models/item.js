import Model from 'ember-data/model';
import attr from 'ember-data/attr';
// import { belongsTo, hasMany } from 'ember-data/relationships';
import ENV from '../config/environment';

export default Model.extend({
  uuid: attr(),
  name: attr(),
  description: attr(),
  rarity: attr(),

  use(target) {
    let url;
    let uuid = this.get('uuid');
    if (target) {
      url = `${ENV.gameURL}/items/use/${uuid}?target=${target}`;
    } else {
      url = `${ENV.gameURL}/items/use/${uuid}`;
    }

    fetch(url, {
      method: 'POST',
      headers: {
        apikey: localStorage.getItem('apikey')
      }
    }).then(response => {
      if (response && response.ok) {
        localStorage.setItem('lastItemUse', new Date());
        response.json().then(this.processRequest.bind(this));
      }
    }).catch(error => {
      console.log(error);
    });
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

    this.deleteRecord();
    this.save();
  }
});
