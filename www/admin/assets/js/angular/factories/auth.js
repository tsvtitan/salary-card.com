
app.factory('Auth',['$rootScope','$http','Route','Urls','Dictionary','Payload','Utils','Const',
                    function($rootScope,$http,Route,Urls,Dictionary,Payload,Utils,Const) {
  
  function updateStates(auth) {
    
    Route.clear();
    Route.state(auth.loginPage.name,{
      url: auth.loginPage.url,
      templateUrl: auth.loginPage.template
    });
    
    Utils.forEach(auth.pages,function(page){
      
      Route.state(page.name,{
        url: page.url,
        templateUrl: page.template
      });
    });
  }
  
  var auth = {
    
    user: false,
    ready: false,
    logining: false,
    logouting: false,
    captcha: false,
    templates: [],
    menu: [],
    pages: [],
    loginPage: {name:'login',url:'/login',template:'login.html'},
    
    setTemplates: function(tpls) {
      
      Route.clear();
      
      for (var i in this.defTemplates) {
        var t = this.defTemplates[i];
        Route.state(t.name,{
          url: t.url,
          templateUrl: t.templateUrl
        });
      }
        
      if (Utils.isArray(tpls)) {
        
        this.templates = [];
        
        for (var i in tpls) {
          var t = tpls[i];
          
          Route.state(t.name,{
            url: t.url,
            templateUrl: t.templateUrl
          });
          
          this.templates.push(t);
          
        }
      }
    },
    
    set: function(auth) {
      
      if (Utils.isObject(auth)) {
        this.user = auth.user;
        this.captcha = auth.captcha;
        this.menu = Utils.isArray(auth.menu)?auth.menu:[];
        this.pages = Utils.isArray(auth.pages)?auth.pages:[];
      } else {
        this.user = false;
        this.captcha = false;
        this.menu = [];
        this.pages = [];
      }
      updateStates(this);
    },
    
    login: function(data,result) {
      var self = this;
      if (!self.user) {
        $http.post(Urls.authLogin,Payload.get(data)).success(function(d){
          self.set(d);
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
      if (Utils.isObject(self.user) && !self.logouting) {
        self.logouting = true;
        $http.post(Urls.authLogout,{userId:self.user.id}).success(function(d){
          if (!d.error) {
            self.set();
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
    },
    
    pageExists: function(name) {
      
      var obj = Utils.findWhere(this.pages,{name:name});
      return (obj) || this.loginPage.name===name;
    },
    
    getDefaultPageName: function() {
      
      var name = null;
      if (this.user) {
        if (this.pageExists(this.user.page)) {
          name = this.user.page;
        } else if (Utils.isArray(this.pages) && this.pages.length>0) {
          name = this.pages[0].name;
        }
      } else {
        name = this.loginPage.name;
      }
      return name;
    },
    
    getDefaultUrl: function() {
      
      var url = null;
      if (this.user) {
        
        var page = Utils.findWhere(this.pages,{name:this.user.page});
        if (page) {
          url = page.url;
        } else if (Utils.isArray(this.pages) && this.pages.length>0) {
          url = this.pages[0].url;
        }
                
      } else url = this.loginPage.url;
              
      return url;
    }
  }
  
  return auth;
}]);