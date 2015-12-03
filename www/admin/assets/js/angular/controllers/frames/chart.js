
app.controller('frameChart',['$scope','Const','Alert',
                             function($scope,Const,Alert){
  
  if ($scope.chart) {
    
    $scope.chart.load({});
    
  } else Alert.error(Const.chartNotAvailable);
  
}]);