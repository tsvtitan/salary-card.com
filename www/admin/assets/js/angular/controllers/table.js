
app.controller('table',['$scope','$element','Const','Alert','Dictionary',
                        function($scope,$element,Const,Alert,Dictionary){
/*app.controller('table',['$scope','Const','Alert',
                        function($scope,Const,Alert){*/
  
  $scope.table = ($scope.frame.isTable())?$scope.frame:null;
  $scope.dic = Dictionary.dic($element,$scope.frame.controllerName);
  
  if ($scope.table) {
  
    $scope.table.load({});
    
    if ($scope.table.name === 'salaries') {
      console.log($scope.dic('Зарплаты'));
    }
    
  } else Alert.error(Const.tableNotAvailable);
  
}]);