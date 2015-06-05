
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
    columns: 'json',
    tree: 'json',
    template: 'stirng',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  }
  
}