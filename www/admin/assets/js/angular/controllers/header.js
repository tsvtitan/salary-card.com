
app.controller('partialHeader',['$scope','$element','$timeout',
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

          $scope.reload('login');
          Auth.logouting = false;

        },Const.timeoutHide);
      }
    });
  }

  Init.once('header',function(){
    
    Auth.onLogout(function(){
      Auth.logouting = true;
    });
  });
  
}]);