
app.controller('frameForm',['$scope','Const','Alert',
                            function($scope,Const,Alert){
  
  /*$scope.submit = function() {
    Alert.info('submit');
    if ($scope.form && $scope.form.submit && $scope.form.submit.page) {
      $scope.reload($scope.form.submit.page);
    }
  }*/
  
  $scope.click = function(button) {
    Alert.info(button.title);
    if (button.name==='submit') {
      if (button.page) {
        $scope.reload(button.page);
      }
    }
  }
  
  if ($scope.form) {
  
    //$scope.form.load({});
    
  } else Alert.error(Const.formNotAvailable);
  
  
}]);