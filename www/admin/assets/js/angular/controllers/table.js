
app.controller('table',['$scope','Const','Alert','Utils',
                        function($scope,Const,Alert,Utils){
  
  $scope.table = (Utils.isObject($scope.frame) && $scope.frame.isTable())?$scope.frame:null;

  if ($scope.table) {
  
    /*$scope.reload = function() {
      $scope.table.reload();
    }
    
    $scope.execute = function(a) {
      $scope.table.execute(a);
    }*/

    $scope.table.load({});
    
  } else Alert.error(Const.tableNotAvailable);
  
}]);