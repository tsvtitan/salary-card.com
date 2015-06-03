
module.exports = {

  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    title: {
      type: 'string',
      required: true
    },
    items: 'json',
    locked: 'datetime',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  }
}