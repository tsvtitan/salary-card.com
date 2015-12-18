
app.controller('frameChartCandlestickBar',['$scope','$rootScope','Const','Alert','Utils',
                                           function ($scope,$rootScope,Const,Alert,Utils) {
  
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
    
    $rootScope.$on('strengthAdd',function(event,data) {
      
      $scope.chart.reload(function(){
        $scope.chart.collapsed = false;
      });
    });
    
    $scope.chart.load();
    
  } else Alert.error(Const.chartNotAvailable);
}]);