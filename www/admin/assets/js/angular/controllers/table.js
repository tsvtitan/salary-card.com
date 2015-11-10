
app.controller('table',['$scope','$element','Const','Alert','Dictionary',
                        function($scope,$element,Const,Alert,Dictionary){
  
  $scope.table = ($scope.frame.isTable())?$scope.frame:null;
  //$scope.dic = Dictionary.dic($element);
  
  if ($scope.table) {
  
    $scope.table.load({});
    
  } else Alert.error(Const.tableNotAvailable);
  
}]);