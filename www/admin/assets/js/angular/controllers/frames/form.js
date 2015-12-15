
app.controller('frameForm',['$scope','Const','Alert',
                            function($scope,Const,Alert){
  
  if ($scope.form) {
  
    $scope.submit = function() {
      if ($scope.form) $scope.form.submit(this[$scope.form.name]);
    }

    $scope.form.load({});
    
  } else Alert.error(Const.formNotAvailable);
  
  
}]);