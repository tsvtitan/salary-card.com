
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
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  },
  
  import: function(user,params,files,result) {
    
    var log = this.log;
    log.debug(params);
    log.debug(files);
    result(null,{ttt:123});
  }
  
}