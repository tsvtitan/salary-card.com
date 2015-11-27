
module.exports = {

  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    name: {
      type: 'string',
      required: true
    },
    title: 'string',
    description: 'string',
    //model: 'string',
    template: 'stirng',
    controller: 'string',
    fields: 'json',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  }
  
}