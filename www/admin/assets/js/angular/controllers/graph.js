
app.controller('graph',['$scope','Const','Alert','Utils',
                        function($scope,Const,Alert,Utils){
  
  $scope.graph = (Utils.isObject($scope.frame) && $scope.frame.isGraph())?$scope.frame:null;

  if ($scope.graph) {
  
    $scope.graph.load({});
    
  } else Alert.error(Const.tableNotAvailable);
  
}]);