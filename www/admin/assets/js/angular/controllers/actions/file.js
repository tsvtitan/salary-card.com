
app.controller('actionFile',['$scope','Utils',
                             function($scope,Utils) {
    
  $scope.execute = function(files) {
    
    if (files && !Utils.isEmpty(files) && Utils.isObject($scope.action)) {
      $scope.action.execute(null,files);
    } 
  }
  
}]);