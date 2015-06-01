/* global Utils */

// Template

module.exports = {

  migrate: 'safe',
  autoPK: false,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    id: {
      type: 'string',
      unique: true,
      primaryKey: true,
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    template: {
      type: 'string',
      required: true
    },
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  },
  
  getByUser: function (user,fields,result) {

    this.find(function(err,templates){

      if (err) {

        result(err,[]);

      } else if (templates) {

        function access(tpl) {

          if (Utils.isString(tpl.id)) {

            if (Utils.isObject(user.templates)) {

              for (var t1 in user.templates) {
                if (tpl.id.search(t1)!==-1) {
                  return user.templates[t1];
                }
              }
            } else {
              
              if (Utils.isString(user.templates)) {
                var r = user.templates==='*';
                if (!r) {
                  r = tpl.id.search(user.templates)!==-1;
                }
                return r;
              }
            }
          }
          return false;
        }

        var tpls = [];
        
        for (var i in templates) {
          var t = templates[i];
          var a = access(t);
          if (a) {
            tpls.push({
              name: t.name,
              url: t.url,
              templateUrl: t.templateUrl
            });
          }
        }
        result(null,tpls);

      } else result(null,[]);

    });
  }
  
}
