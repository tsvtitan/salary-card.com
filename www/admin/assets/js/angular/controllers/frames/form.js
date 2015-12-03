
app.controller('frameForm',['$scope','Const','Alert',
                            function($scope,Const,Alert){
  
  $scope.submit = function() {
    Alert.info('submit');
    if ($scope.form && $scope.form.options && $scope.form.options.submit && $scope.form.options.submit.page) {
      $scope.reload($scope.form.options.submit.page);
    }
  }
  
  $scope.cancel = function() {
    Alert.info('cancel');
  }
  
  if ($scope.form) {
  
    //$scope.form.load({});
    
  } else Alert.error(Const.formNotAvailable);
  
  
}]);