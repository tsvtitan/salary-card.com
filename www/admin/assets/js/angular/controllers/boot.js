
app.controller('boot',['$rootScope','$scope','$state','$element','$location','$q','$timeout',
                       'Init','Auth','Route','Dictionary','Const','Utils',
                       function($rootScope,$scope,$state,$element,$location,$q,$timeout,
                                Init,Auth,Route,Dictionary,Const,Utils) {
  
  $scope.auth = Auth;
  $scope.dic = Dictionary.dic($element);
  $scope.visible = false;
  $scope.spinner = false;
  $scope.lastPath = $location.path();
  $scope.changing = false;

  Route.clear();
  Route.defaultUrl('/home');

  Auth.setDefTemplates({
    login:{url:'/login',templateUrl:'login.html'},
    home:{url:'/home',templateUrl:'home.html'},
    profile:{url:'/user/profile',templateUrl:'user/profile.html'}
  });

  $scope.showSpinner = function() { 
    $scope.spinner = true; 
  }
  
  $scope.hideSpinner = function() { 
    $scope.spinner = false; 
  }
  
  $scope.tryAuth = function(state) {
    
    if ($scope.visible) {
      if (!Auth.user && $state.current.name!=='login') {
        
        $state.go('login');
        return false;
        
      } else if (Auth.user) {
        
        var s = (state)?state:'home';
        if ($state.current.name!==s) {
          
          $state.go(s);
          return false;
        }

        return true;
      }
    } else return false;
  }
  
  $scope.reload = function(name) {
    if (!name) { name = 'home'; }
    $state.transitionTo(name,{},{reload:true,inherit:false,notify:true});
  }
  
  $rootScope.$on('$stateChangeStart',function(event,toState) {
    
    try {
      if (!$scope.changing) {
        $scope.changing = true;
        if ($scope.tryAuth(toState)) {
          $scope.showSpinner();
        } else {
          event.preventDefault();
        }
      }
    } finally {
      $scope.changing = false;
    }
  });
  
  Auth.onLogout(function(){
    Init.reset();
  });
  
  Init.get(function(d){
    
    Dictionary.init(d.dictionary);

    Auth.user = d.auth.user;
    Auth.captcha = d.auth.captcha;
    Auth.setTemplates(d.auth.templates);

    $scope.visible = true;
    if (Auth.user && $scope.lastPath && $scope.lastPath!=='/') {
      $location.path($scope.lastPath); // need to change $state.go(lastState)
    } else $scope.tryAuth();

    Auth.ready = (Auth.user);
    if (Auth.ready) Auth.emitLogin();
    
  });
  
}]);