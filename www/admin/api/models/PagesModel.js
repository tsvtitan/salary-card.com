
module.exports = {

  tableName: 'pages',
  migrate: 'safe',
  autoPK: true, // need for id
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    
    name: {
      type: 'string',
      required: true
    },
    title: 'string',
    description: 'string',
    url: 'string',
    template: 'string',
    priority: 'integer',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  }
  
}