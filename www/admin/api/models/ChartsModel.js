
module.exports = {
  
  tableName: 'charts',
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
    icon: 'string',
    template: 'stirng',
    canCollapse: 'boolean',
    collapsed: 'boolean',
    canClose: 'boolean',
    options: 'json',
    controller: 'string',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  }
  
}