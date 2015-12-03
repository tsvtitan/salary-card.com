
app.controller('tableCorrections',['$scope','$element','Const','Alert','Dictionary',
                                   function ($scope,$element,Const,Alert,Dictionary) {
  
  $scope.table = $scope.parent.isTable()?$scope.parent:null;
  $scope.dic = Dictionary.dic($element,$scope.parent.controllerName);
  
  if ($scope.table) {
    
    $scope.table.load({},function(d){
      
      if (d.error) Alert.error(d.error);
      else {
        
        $scope.table.setData(d.data);
      }
    });
    
  } else Alert.error(Const.tableNotAvailable);
}]);