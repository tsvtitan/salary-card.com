// AuthController

module.exports = {
	
  login: function(req,res) {
    
    var log = this.log;
    
    function error(s,values) {
      log.error(s,values,1);
      res.jsonError('Login error');
    }
    
    function userNotFound(data) {
      
      if (req.body.login) {
        log.debug('User {login} is not found',req.body);
        res.jsonError('User {login} is not found',req.body,data);
      } else {
        log.debug('User is not found');
        res.jsonError('User is not found',null,data);
      }
    }
    
    try {
      
      if (req.session) {
        
        if (!req.session.userId) {
          
          var captcha = true;
          if (req.session.loginCaptcha) {
            captcha = (req.session.loginCaptcha===req.body.captcha);
          }
          
          if (captcha) {
            
            var loginCount = (req.session.loginCount)?req.session.loginCount:0;
            var lockOnFail = (loginCount+1)>8;

            Users.getByLogin(req.body.login,req.body.pass,
                             lockOnFail,true,
                             function(err,user,env){
              
              if (err) error(err);
              else {

                req.session.loginCount = loginCount+1;
                
                var u = false;
                if (user && !user.locked) {

                  u = {
                    id: user.id,
                    login: user.login,
                    email: user.email,
                    name: user.name,
                    firstName: user.firstName,
                    page: user.page,
                    images: user.images
                  }
                  req.session.userId = u.id;
                  delete req.session.loginCount;
                  delete req.session.loginCaptcha;
                }
                
                var data = {
                  user: u,
                  captcha: req.session.loginCount>2
                }
                
                data = Utils.extend(data,env);
                
                setTimeout(function onLoginResponse() {

                  if (u)
                    res.jsonSuccess(data);
                  else 
                    userNotFound(data);

                },250);
              }
            });
            
          } else {
            
            var data = {
              user: false,
              captcha: true
            };
            
            setTimeout(function onLoginResponse() {

              log.debug('Captcha is invalid');
              
              var error = {
                message: 'Code is invalid',
                fields: ['captcha']
              }
              res.jsonError(error,null,data);

            },250);
          }
          
        } else error('User is already set');
      } else error('Session is not found');
      
    } catch(e) {
      error(e.message);
    }
  },
  
  logout: function(req,res) {
    
    var log = this.log;
    
    function error(s,values) {
      log.error(s,values,1);
      res.jsonError('Logout error');
    }
    
    try {
      
      if (req.session) {
        if (req.session.userId===req.body.userId) {

          req.session.destroy();
          req.session = null;

          setTimeout(function() {
            res.jsonSuccess();
          },500);


        } else error('User is not found');
      } else error('Session is not found');
      
    } catch(e) {
      error(e.message);
    }
  }
};



