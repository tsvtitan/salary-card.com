
app.controller('actionOptions',['$scope','Utils','Alert',
                                function($scope,Utils,Alert) {
    
  $scope.execute = function() {
    
    if (Utils.isObject($scope.action)) {
      //$scope.action.execute(null,files);
      Alert.info($scope.action.title);
    } 
  }
  
}]);