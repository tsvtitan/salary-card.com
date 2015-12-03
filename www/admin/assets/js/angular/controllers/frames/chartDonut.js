
app.controller('frameChartDonut',['$scope','Const','Alert',
                                  function ($scope,Const,Alert) {
  
  if ($scope.chart) {
    
    $scope.chart.options.chart.pie = {
      startAngle: function(d) { return d.startAngle/2 -Math.PI/2 },
      endAngle: function(d) { return d.endAngle/2 -Math.PI/2 }
    };
    
    $scope.chart.load();
    
  } else Alert.error(Const.chartNotAvailable);
}]);