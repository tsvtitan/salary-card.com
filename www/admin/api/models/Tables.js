
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
    icon: 'string',
    model: 'string',
    canCollapse: 'boolean',
    collapsed: 'boolean',
    canClose: 'boolean',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  }
  
}