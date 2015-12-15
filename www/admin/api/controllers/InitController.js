// InitController

module.exports = {

  get: function(req,res) {
    
    var log = this.log;
    
    function error(s,values) {
      log.error(s,values,1);
      res.jsonError('Initialization error');
    }
    
    function getEnvironment(result) {
      
      if (req.session && req.session.userId) {
        
        UsersModel.getEnvironment(req.session.userId,function(err,user,env){
        
          result(err,user,env,!(user));
        });
        
      } else result();
    }
    
    var log = this.log;
    
    try {
      var i18n = sails.config.i18n;
      var locale = i18n.defaultLocale;
      if (req.locale) {
        locale = req.locale;
      }
      var fileName = res.fmt('%s/%s%s',[i18n.directory,locale,i18n.extension]);

      var fs = require('fs');
      if (fs.exists(fileName,function(exists){

        if (exists) {

          getEnvironment(function(err,user,env,reset) {

            if (err) error(err)
            else if (!reset) {
              
              var d = require(fileName);

              delete d['back'];
              var f = d['front'];
              delete d['front'];

              for (var k in f) {
                d[k] = f[k];
              }
              
              var u = false;
              if (user && !user.locked) {
                u = {
                  id: user.id,
                  login: user.login,
                  email: user.email,
                  name: user.name,
                  firstName: user.firstName,
                  images: user.images,
                  page: user.page
                }
              }
              
              var loginCount = (req.session.loginCount)?req.session.loginCount:0;
              
              var auth = {
                user: u,
                captcha: loginCount>2
              }
              
              var data = {
                auth: Utils.extend(auth,env),
                dictionary:d
              }
              
              setTimeout(function(){
                if (user)
                  res.jsonSuccess(data);
                else
                  res.jsonError('User is not found',null,data);
              },0);

            } else {
              
              log.warn('Session needs to be cleared');
              
              req.session.destroy();
              req.session = null;  
              
              res.jsonSuccess({auth:false});
            }
          });

        } else error('Init file {name} is not found',{name:fileName});
        
      }));
      
    } catch(e) {
      error(e.message);
    }  
  }
};
