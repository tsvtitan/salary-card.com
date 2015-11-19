
app.controller('chartDonut',['$scope','$element','Const','Alert','Dictionary',
                              function ($scope,$element,Const,Alert,Dictionary) {
  
  $scope.chart = ($scope.frame.isChart())?$scope.frame:null;
  $scope.dic = Dictionary.dic($element,$scope.frame.controllerName);
  
  if ($scope.chart) {
    
    $scope.chart.options.chart.pie = {
      startAngle: function(d) { return d.startAngle/2 -Math.PI/2 },
      endAngle: function(d) { return d.endAngle/2 -Math.PI/2 }
    };
    
    $scope.chart.load();
    
  } else Alert.error(Const.chartNotAvailable);
}]);