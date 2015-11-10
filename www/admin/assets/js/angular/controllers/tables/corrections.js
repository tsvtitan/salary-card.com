
app.controller('tableCorrections',['$scope','Const','Alert','Utils',
                                   function ($scope,Const,Alert,Utils) {
  
  $scope.table = ($scope.frame.isTable())?$scope.frame:null;
  
  if ($scope.table) {
    
    $scope.table.load({},function(d){
      
      if (d.error) Alert.error(d.error);
      else {
        
        $scope.table.setData(d.data);
      }
    });
    
  } else Alert.error(Const.tableNotAvailable);
}]);