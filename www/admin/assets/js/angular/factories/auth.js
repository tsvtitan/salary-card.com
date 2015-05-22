
app.factory('Auth',['$rootScope','$http','Route','Urls','Dictionary','Payload','Utils','Const',
                    function($rootScope,$http,Route,Urls,Dictionary,Payload,Utils,Const) {
  
  var auth = {
    
    user: false,
    ready: false,
    logining: false,
    logouting: false,
    captcha: false,
    defTemplates: {},
    templates: {},
    menu: {},
    
    setTemplates: function(tpls) {
      if (tpls) {
        
        Route.clear();
        for (var k in this.defTemplates) {
          var t = this.defTemplates[k];
          Route.state(k,t);
        }
        
        this.templates = {};
        this.menu = {};
        for (var k in tpls) {
          var t = tpls[k];
          Route.state(k,{url:t.url,templateUrl:t.template});
          this.templates[k] = t;
          if (t.menu) {
            this.menu[k] = t;
          }
        }
      }
    },
    
    setDefTemplates: function(tpls) {
      this.defTemplates = tpls;
    },

    login: function(data,result) {
      var self = this;
      if (!self.user) {
        $http.post(Urls.authLogin,Payload.get(data)).success(function(d){
          self.user = d.user;
          self.captcha = d.captcha;
          self.setTemplates(d.templates);
          result(d);
        }).error(function(d){
          result({error:Dictionary.connectionFailed(d),user:this.user});
        });
      } else {
        result({error:false,user:this.user});
      }
    },

    logout: function (result) {
      var self = this;
      if (self.user && !self.logouting) {
        self.logouting = true;
        $http.post(Urls.authLogout,{userId:self.user.id}).success(function(d){
          if (!d.error) {
            self.user = false;
            self.captcha = false;
            self.setTemplates({});
          }
          self.logouting = false;
          result(d);
        }).error(function(d){
          self.logouting = false;
          result({error:Dictionary.connectionFailed(d)});
        });
      } else { result({error:false}); }
    },
    
    getUserImageProfileSmallUrl: function() {
      
      var r = '';
      if (this.user) {
        if (this.user.images && this.user.images.profileSmall)
          r = Urls.root.concat(this.user.images.profileSmall);
        else 
          r = Utils.format(Urls.userProfileSmallImage,this.user);
      }
      return r;
    },
    
    onEvents: function(events,callback) {
      
      if (Utils.isString(events)) {
        $rootScope.$on(events,callback);
      } else if (Utils.isArray(events)) {

        Utils.forEach(events,function(event){
          $rootScope.$on(event,callback);
        });
      }
    },
    
    onLogin: function(callback) {
      this.onEvents([Const.eventLogin],callback);
    },
    
    emitLogin: function() {
      $rootScope.$broadcast(Const.eventLogin);
    },
  
    onLogout: function(callback) {
      this.onEvents([Const.eventLogout],callback);
    },
    
    emitLogout: function() {
      $rootScope.$broadcast(Const.eventLogout);
    }
  }
  
  return auth;
}]);