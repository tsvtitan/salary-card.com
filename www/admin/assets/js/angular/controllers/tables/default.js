
app.controller('tableDefault',['$scope','Tables','Alert',
                               function($scope,Tables,Alert){
  
  $scope.table = $scope.frame;


  if ($scope.table) {
    
    /*$scope.table.loading = true;
    
    Tables.get($scope.table,function(d){
      
      if (d.error) {
        Alert.error(d.error);
      } else {
        
        
      }
      
    });*/
                                   
    $scope.table.load({});
  }
}]);