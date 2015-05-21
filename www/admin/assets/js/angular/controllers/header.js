
app.controller('header',['$rootScope','$scope','$state','$element','$timeout',
                         'Auth','Dictionary','Const','Alert',
                         function($rootScope,$scope,$state,$element,$timeout,
                                  Auth,Dictionary,Const,Alert) {
  
  $scope.dic = Dictionary.dic($element);
  
  $scope.onLogout(function(){
    Auth.logouting = true;
  });
  
  $scope.logout = function() {
    
    Auth.logout(function(d) {
      
      if (d.error) {
        Alert.error(d.error);
      } else {
        
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
}]);