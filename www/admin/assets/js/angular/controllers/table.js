
app.controller('table',['$scope','Const','Alert','Utils',
                        function($scope,Const,Alert,Utils){
  
  $scope.table = (Utils.isObject($scope.frame) && $scope.frame.isTable())?$scope.frame:null;

  if ($scope.table) {
  
    $scope.table.load({},function(d){
      
      if (d.error) {
        Alert.error(d.error);
      } else {
        Alert.info(JSON.stringify(d));
      }
    });
    
  } else Alert.error(Const.tableNotAvailable);
  
}]);