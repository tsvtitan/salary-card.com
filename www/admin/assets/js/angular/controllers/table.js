
app.controller('table',['$scope','Const','Alert','Utils',
                        function($scope,Const,Alert,Utils){
  
  $scope.table = ($scope.frame.isTable())?$scope.frame:null;
  
  if ($scope.table) {
  
    $scope.table.load({});
    
  } else Alert.error(Const.tableNotAvailable);
  
}]);