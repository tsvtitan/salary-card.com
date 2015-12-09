
app.controller('frameTableSectors',['$scope','Const','Alert',
                                    function ($scope,Const,Alert) {
  
  if ($scope.table) {
    
    $scope.table.load({},function(d){
      
      if (d.error) Alert.error(d.error);
      else {
        
        $scope.table.setData(d.data);
        
        Alert.info('Sectors are loaded');
      }
    });
    
  } else Alert.error(Const.tableNotAvailable);
}]);