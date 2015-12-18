
app.controller('boot',['$rootScope','$scope','$state','$element','$timeout',
                       'Init','Auth','Route','Dictionary','Const','Utils','Alert','Page',
                       function($rootScope,$scope,$state,$element,$timeout,
                                Init,Auth,Route,Dictionary,Const,Utils,Alert,Page) {
  
  $scope.auth = Auth;
  $scope.dic = Dictionary.dic($element);
  $scope.page = Page;
  $scope.visible = false;
  $scope.spinner = false;
  $scope.changing = false;

  Route.clear();
  
  function defaultUrl() {
    Route.defaultUrl(Auth.getDefaultUrl());
  }
  
  defaultUrl();

  $scope.showSpinner = function() { 
    $scope.spinner = true; 
  }
  
  $scope.hideSpinner = function() { 
    $scope.spinner = false; 
  }
  
  /*$scope.reload = function(name) {
    
    if (Utils.isEmpty(name)) {
      name = Auth.getDefaultPageName();
    }
    
    if (Auth.pageExists(name)) {
      
      $state.transitionTo(name,{},{reload:true,inherit:false,notify:true});
      return true;
      
    } else Alert.error(Const.pageNotAvailable);
  }*/
                         
  $scope.reload = function(name) {
    
    Page.reload(name);
  }
  
  $scope.ready = function(error,result) {
    
    if (Utils.isString(error)) Alert.error(error);
    $timeout(function(){
      $scope.hideSpinner();
      if (Utils.isFunction(error)) error();
      else if (Utils.isFunction(result)) result();
    },500);
  }
  
  function tryState(state) {
    
    if ($scope.visible) {
      
      if (Auth.user && state!==Auth.loginPage.name) {
        
        var s = (state)?state:Auth.getDefaultPageName();
        if ($state.current.name!==s) {
          
          $state.go(s);
          return {spinner:true};
        } 

        return false;
        
      } else if (!Auth.user) {
        
        $state.go(Auth.loginPage.name);
        return {spinner:false};
      }
    }
    return false;
  }
  
  $rootScope.$on('$stateChangeStart',function(event,toState) {
    
    try {
      if (!$scope.changing) {
        $scope.changing = true;
        
        var r = tryState(toState.name);
        if (r) {
          
          Route.setLastState(toState.name);
          Auth.setHtmlTitle(toState.name);
          if (r.spinner) $scope.showSpinner();
          
          var page = Auth.getPage(toState.name);
          Auth.setMenuByPage(page);
          Page.set(page);
          
        } else {
          $scope.hideSpinner();
          event.preventDefault();
        }
      }
    } finally {
      $scope.changing = false;
    }
  });
  
  Auth.onLogin(function(){
    
    $rootScope.$on(Const.eventReload,function(event,name){
      $scope.reload(name);
    });
    
    defaultUrl();
  });
  
  Auth.onLogout(function(){
    defaultUrl();
    Init.reset();
  });
  
  Init.get(function(d){
    
    Dictionary.init(d.dictionary);
    Auth.set(d.auth);
    
    $scope.visible = true;
    
    Auth.ready = (Auth.user);
    if (Auth.ready) Auth.emitLogin();
    
    $scope.reload();
    
  });
  
}]);