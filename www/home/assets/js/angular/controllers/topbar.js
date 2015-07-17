
app.controller('topbar',['$scope','$element','$timeout',
                         'Auth','Dictionary','Const','Alert','Init',
                         function($scope,$element,$timeout,
                                  Auth,Dictionary,Const,Alert,Init) {
  
  $scope.dic = Dictionary.dic($element);
  
  $scope.logout = function() {

    Auth.logout(function(d) {

      if (d.error) {
        Alert.error(d.error);
      } else {

        Auth.user = false;
        Auth.emitLogout();

        $timeout(function(){

          Auth.ready = false;

          $scope.reload(Const.stateLogin);
          Auth.logouting = false;

        },Const.timeoutHide);
      }
    });
  }

  
}]);