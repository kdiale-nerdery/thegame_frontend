import Model from 'ember-data/model';
import attr from 'ember-data/attr';
// import { belongsTo, hasMany } from 'ember-data/relationships';
import ENV from '../config/environment';

export default Model.extend({
  uuid: attr(),
  name: attr(),
  description: attr(),
  rarity: attr(),
  bonusRegex: /<([0-9a-f-]+)>.*\| <([\w ]+)>/,

  use(target, addMessage = true) {
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
        response.json().then(this.processRequest.bind(this, addMessage));
      }
    }).catch(error => {
      console.log(error);
    });
  },

  processRequest(addMessage, json) {
    for (let message of json.Messages) {
      let matches = this.bonusRegex.exec(message);

      if (matches) {
        console.log('Item uuid ' + matches[1]);
        console.log('Creating item ' + matches[2]);
        this.get('store').createRecord(
          'item',
          {
            name: matches[2],
            uuid: matches[1]
          }
        );
      }

      if (addMessage && !matches) {
        this.get('store').createRecord(
          'message',
          {
            content: message
          }
        ).save();
      }
    }

    this.deleteRecord();
    this.save();
  }
});
