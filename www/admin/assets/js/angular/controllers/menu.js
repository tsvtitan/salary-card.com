
app.controller('menu',['$rootScope','$scope','$state','$element','$timeout',
                       'Auth','Dictionary','Const','Alert','Init',
                       function($rootScope,$scope,$state,$element,$timeout,
                                Auth,Dictionary,Const,Alert,Init){
  
  $scope.dic = Dictionary.dic($element);
  $scope.name = '';
  $scope.email = '';
  $scope.imageProfileUrl = '';
  
  $scope.logout = function() {
    
    Auth.logout(function(d) {

      if (d.error) {
        Alert.error(d.error);
      } else {
        
        Auth.logouting = true;
        Auth.user = false;
        Auth.emitLogout();

        $timeout(function(){

          Auth.ready = false;
          $scope.reload('login');
          Auth.logouting = false;
          
        },Const.timeoutHide);
      }
    });
  }
  
  function init() {
    
    if (Auth.user) {
      var s = Auth.user.name+' '+((Auth.user.firstName)?Auth.user.firstName:'');
      $scope.name = (Auth.user.name)?s.trim():Auth.user.login;
      $scope.email = (Auth.user.email)?Auth.user.email:Dictionary.get(Const.emailNotDefined);
    }
    $scope.imageProfileUrl = Auth.getUserImageProfileSmallUrl();
  }
  
  Init.once('menu',function(){
    
    Auth.onLogin(function(){
      init();
    });
  });
  
  init();
  
}]);