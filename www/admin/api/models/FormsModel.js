
module.exports = {
  
  tableName: 'forms',
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
    canCollapse: 'boolean',
    collapsed: 'boolean',
    canClose: 'boolean',
    canReload: 'boolean',
    options: 'json',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  }
  
}