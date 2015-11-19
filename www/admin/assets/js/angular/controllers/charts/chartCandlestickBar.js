
app.controller('chartCandlestickBar',['$scope','$element','Const','Alert','Dictionary','Utils',
                                      function ($scope,$element,Const,Alert,Dictionary,Utils) {
  
  $scope.chart = ($scope.frame.isChart())?$scope.frame:null;
  $scope.dic = Dictionary.dic($element,$scope.frame.controllerName);
  
  if ($scope.chart) {
    
    $scope.chart.options.chart.xAxis = Utils.extend($scope.chart.options.chart.xAxis,{
      tickFormat: function(d) {
        return d3.time.format('%x')(new Date(new Date() - (20000 * 86400000) + (d * 86400000)));
      }
    });
    
    $scope.chart.options.chart.yAxis = Utils.extend($scope.chart.options.chart.yAxis,{
      tickFormat: function(d) {
        return '$' + d3.format(',.1f')(d);
      }
    });
    
    $scope.chart.load();
    
  } else Alert.error(Const.chartNotAvailable);
}]);