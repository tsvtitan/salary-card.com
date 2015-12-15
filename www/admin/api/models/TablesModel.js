
module.exports = {
  
  tableName: 'tables',
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
    model: 'string',
    template: 'stirng',
    controller: 'string',
    canCollapse: 'boolean',
    collapsed: 'boolean',
    actions: 'json',
    options: 'json',
    sort: 'json',
    children: 'string',
    canClose: 'boolean',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  }
  
}