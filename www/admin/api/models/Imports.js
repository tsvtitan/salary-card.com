
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
    creator: 'string',
    created: 'datetime',
    path: 'string',
    size: 'integer',
    fileName: 'string',
    data: 'json',
    priority: 'integer',
    error: 'string',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  }
  
}