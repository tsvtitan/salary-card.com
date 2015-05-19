
app.controller('header',['$rootScope','$scope','$state','$element','$timeout','Auth','Dictionary','Const',
                         function($rootScope,$scope,$state,$element,$timeout,Auth,Dictionary,Const) {
  
  $scope.dic = Dictionary.dic($element);
  $scope.state = {logout:false};

  $scope.logout = function() {
    
    $scope.state.logout = true;
            
    if (Auth.user) {
      
      Auth.logout(function(d) {
        
        if (d.error) {
          $scope.showError(d.error);
        } else {
          Auth.user = false;
          $timeout(function(){
            Auth.ready = false;
            $scope.reload('login');
            $scope.state.logout = false;
          },Const.timeoutHide);
        }
      });
    } else $scope.state.logout = false;
  }
}]);