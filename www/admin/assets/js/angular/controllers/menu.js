
app.controller('menu',['$rootScope','$scope','$state','$element','$timeout',
                       'Auth','Dictionary','Const','Alert',
                       function($rootScope,$scope,$state,$element,$timeout,
                                Auth,Dictionary,Const,Alert){
  
  $scope.dic = Dictionary.dic($element);
  
  function init() {
    $scope.name = '';
    $scope.email = '';
    if (Auth.user) {
      var s = Auth.user.name+' '+((Auth.user.firstName)?Auth.user.firstName:'');
      $scope.name = (Auth.user.name)?s.trim():Auth.user.login;
      $scope.email = (Auth.user.email)?Auth.user.email:Dictionary.get(Const.emailNotDefined);
    }
    $scope.imageProfileUrl = Auth.getUserImageProfileSmallUrl();
    
  }
  
  $scope.onInit(function(){
    init();
  });
  
  $scope.logout = function() {
    
    Auth.logout(function(d) {

      if (d.error) {
        Alert.error(d.error);
      } else {
        
        Auth.logouting = true;
        Auth.user = false;
        $rootScope.$broadcast(Const.eventLogout);

        $timeout(function(){

          Auth.ready = false;
          $scope.reload('login');
          Auth.logouting = false;
          
        },Const.timeoutHide);
      }
    });
  }
  
  init();
  
}]);