

app.controller('actionFile',['$scope','Utils',
                             function($scope,Utils) {
    
  $scope.executeAction = function(files) {
    
    if (files && !Utils.isEmpty(files) && Utils.isObject($scope.action)) {
      $scope.action.execute({test:true},files);
    } 
  }
  
}]);