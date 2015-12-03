
app.controller('frameTable',['$scope','Const','Alert',
                             function($scope,Const,Alert){
  
  if ($scope.table) {
  
    $scope.table.load({});
    
  } else Alert.error(Const.tableNotAvailable);
  
}]);