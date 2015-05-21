
app.controller('boot',['$rootScope','$scope','$state','$element','$location',
                       'Init','Auth','Route','Dictionary','Const','Utils',
                       function($rootScope,$scope,$state,$element,$location,
                                Init,Auth,Route,Dictionary,Const,Utils) {
  
  $scope.auth = Auth;
  $scope.dic = Dictionary.dic($element);
  $scope.visible = false;
  $scope.ready = false;
  $scope.alerts = [];
  $scope.spinner = true;
  $scope.lastPath = $location.path();
  
  Route.clear();
  Route.defaultUrl('/');
  
  Auth.setDefTemplates({
    login:{url:'/login',templateUrl:'login.html'},
    home:{url:'/home',templateUrl:'home.html'}
  });
  
  $scope.showSpinner = function() { $scope.spinner = true; }
  $scope.hideSpinner = function() { $scope.spinner = false; }
  
  $rootScope.$on('$stateChangeStart',function() {
    $scope.showSpinner();
  });
  
  $rootScope.$on('$stateChangeSuccess',function() {
    //$scope.showSpinner();
  });
  
  $scope.tryAuth = function() {
    if ($scope.visible) {
      if (!Auth.user && $state.current.name!=='login') {
        $state.go('login');
      } else if (Auth.user && (($state.current.name==='login') || 
                               ($state.current.name===''))) {
        $state.go('home');
      }
    }
  }
  
  $scope.reload = function(name) {
    if (!name) { name = 'home'; }
    $state.transitionTo(name,{},{reload:true,inherit:false,notify:true});
  }
  
  Init.get(function(d){
    
    Dictionary.init(d.dictionary);
    
    Auth.user = d.auth.user;
    Auth.captcha = d.auth.captcha;
    Auth.setTemplates(d.auth.templates);
    
    $scope.visible = true;
    if (Auth.user && $scope.lastPath && $scope.lastPath!=='/') {
      $location.path($scope.lastPath);
    } else $scope.tryAuth();
    
    Auth.ready = (Auth.user);
    $scope.ready = true;
   
  });
  
}]);