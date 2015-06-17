
app.controller('tableSectors',['$scope','Const','Alert','Utils',
                               function($scope,Const,Alert,Utils){
  
  $scope.table = (Utils.isObject($scope.frame) && $scope.frame.isTable())?$scope.frame:null;

  if ($scope.table) {
  
    $scope.table.load({});
    
  } else Alert.error(Const.tableNotAvailable);
  
}]);