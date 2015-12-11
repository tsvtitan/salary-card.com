
app.controller('frameForm',['$scope','Const','Alert',
                            function($scope,Const,Alert){
  
  $scope.submit = function() {
    if ($scope.form) $scope.form.submit(this[$scope.form.name]);
  }
  
  $scope.click = function(action) {
    if ($scope.form) $scope.form.cancel(action);
  }
  
  if ($scope.form) {
  
    $scope.form.load({});
    
  } else Alert.error(Const.formNotAvailable);
  
  
}]);