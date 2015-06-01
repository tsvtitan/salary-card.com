
app.controller('boot',['$rootScope','$scope','$state','$element','$location','$q','$timeout',
                       'Init','Auth','Route','Dictionary','Const','Utils',
                       function($rootScope,$scope,$state,$element,$location,$q,$timeout,
                                Init,Auth,Route,Dictionary,Const,Utils) {
  
  $scope.auth = Auth;
  $scope.dic = Dictionary.dic($element);
  $scope.visible = false;
  $scope.spinner = false;
  $scope.changing = false;

  Route.clear();
  
  function defaultUrl() {
    Route.defaultUrl((Auth.user)?'/home':'/login');
  }
  
  defaultUrl();

  Auth.setDefTemplates([
    {name:'login',url:'/login',templateUrl:'login.html'},
    {name:'home',url:'/home',templateUrl:'home.html'},
    {name:'profile',url:'/user/profile',templateUrl:'user/profile.html'}
  ]);

  $scope.showSpinner = function() { 
    $scope.spinner = true; 
  }
  
  $scope.hideSpinner = function() { 
    $scope.spinner = false; 
  }
  
  function tryGoTo(state) {
    
    if ($scope.visible) {
      
      if (Auth.user && state!=='login') {
        
        var s = (state)?state:'home';
        if ($state.current.name!==s) {
          
          $state.go(s);
          return {spinner:true};
        } 

        return false;
        
      } else if (!Auth.user) {
        
        $state.go('login');
        return {spinner:false};
      
      }
    }
    return false;
  }
  
  $scope.reload = function(name) {
    if (!name) { name = 'home'; }
    $state.transitionTo(name,{},{reload:true,inherit:false,notify:true});
  }
  
  $scope.ready = function() {
    $timeout(function(){
      $scope.hideSpinner();
    },500);
  }
  
  $rootScope.$on('$stateChangeStart',function(event,toState) {
    
    try {
      if (!$scope.changing) {
        $scope.changing = true;
        
        var r = tryGoTo(toState.name);
        if (r) {
          
          Route.setLastState(toState.name);
          if (r.spinner) $scope.showSpinner();
          
        } else {
          event.preventDefault();
        }
      }
    } finally {
      $scope.changing = false;
    }
  });
  
  Auth.onLogin(function(){
    defaultUrl();
  });
  
  Auth.onLogout(function(){
    defaultUrl();
    Init.reset();
  });
  
  Init.get(function(d){
    
    Dictionary.init(d.dictionary);

    Auth.user = d.auth.user;
    Auth.captcha = d.auth.captcha;
    Auth.setTemplates(d.auth.templates);
    Auth.menu = d.auth.menu;
    
    $scope.visible = true;
    
    Auth.ready = (Auth.user);
    if (Auth.ready) Auth.emitLogin();
    
    tryGoTo((Auth.user)?Auth.user.state:null);
    
  });
  
}]);