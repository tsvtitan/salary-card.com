
app.controller('chart',['$scope','Const','Alert','Utils',
                        function($scope,Const,Alert,Utils){
  
  $scope.chart = (Utils.isObject($scope.frame) && $scope.frame.isChart())?$scope.frame:null;
  
  if ($scope.chart) {
    
    var pie = Utils.extend($scope.chart.options.chart.pie,{
      dispatch: {
        elementClick: function(e){ console.log('click') }  
      }
    });
    
    $scope.chart.options.chart.pie = pie; 
            
    $scope.chart.load({});
    
  } else Alert.error(Const.chartNotAvailable);
  
}]);