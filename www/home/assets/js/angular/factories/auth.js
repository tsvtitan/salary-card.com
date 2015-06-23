
app.factory('Auth',['$rootScope','$http','Route','Urls','Dictionary','Payload','Utils','Const',
                       function($rootScope,$http,Route,Urls,Dictionary,Payload,Utils,Const) {
  
  function updateStates(auth) {
    
    Route.clear();
    Route.state(auth.defaultPage.name,{
      url: auth.defaultPage.url,
      templateUrl: auth.defaultPage.template
    });
    
    Utils.forEach(auth.pages,function(page){
      
      Route.state(page.name,{
        url: page.url,
        templateUrl: page.template
      });
    });
  }
  
  var factory = {
    
    user: false,
    ready: false,
    logining: false,
    logouting: false,
    captcha: false,
    templates: [],
    menu: [],
    pages: [],
    //defaultPage: {name:'home',url:'',template:'home.html'},
    defaultPage: {name:'page',url:'/page',template:'page.html'},
    
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
    
    getPage: function(name) {
      
      return Utils.findWhere(this.pages,{name:name});
    },
    
    pageExists: function(name) {
      
      var obj = this.getPage(name);
      return (obj) || this.defaultPage.name===name;
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
        name = this.defaultPage.name;
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
                
      } else url = this.defaultPage.url;
              
      return url;
    },
    
    setHtmlTitle: function(name) {
      
      var page = this.getPage(name);
      if (page && page.title) {
        $rootScope.title = Utils.format('%s - %s',[Dictionary.get('Title'),page.title]);
      } else {
        $rootScope.title = Dictionary.get('Title');
      }
    }
    
  }
  
  return factory;
}]);