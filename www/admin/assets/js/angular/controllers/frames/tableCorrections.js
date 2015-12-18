
app.controller('frameTableCorrections',['$scope','$rootScope','Const','Alert','Event',
                                        function ($scope,$rootScope,Const,Alert,Event) {
  
  if ($scope.table) {
    
    var collapsed = false;
    
    $scope.table.reloadAndOpen = function(data) {
      
      console.log(data);
      collapsed = false;
      $scope.table.reload(function(){
        $scope.table.collapsed = collapsed;
      });
    }
    
    $rootScope.$on('strengthAdd',function(event,data){
      $scope.table.reloadAndOpen(data);
    });
    
    $scope.table.load({},function(d){
      
      if (d.error) Alert.error(d.error);
      else {
        $scope.table.collapsed = collapsed;
        $scope.table.setData(d.data);
      }
    });
    
  } else Alert.error(Const.tableNotAvailable);
}]);