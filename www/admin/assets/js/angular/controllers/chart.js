
app.controller('chart',['$scope','Const','Alert','Utils',
                        function($scope,Const,Alert,Utils){
  
  $scope.chart = (Utils.isObject($scope.frame) && $scope.frame.isChart())?$scope.frame:null;
  
  if ($scope.chart) {
  
    $scope.chart.load({});
    
  } else Alert.error(Const.chartNotAvailable);
  
}]);