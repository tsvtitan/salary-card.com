
app.controller('pageFrame',['$scope','Page','Utils','Alert','Const',
                             function($scope,Page,Utils,Alert,Const) {
  
  $scope.page = Page;
  $scope.frame = false;
  $scope.state = {visible:false};
  
  Page.frame(function(d){
      
    if (d.error) {
      $scope.ready(d.error);
    } else {
      
      $scope.frame = Utils.isObject(d.frame)?d.frame:false;
      if ($scope.frame) {
        $scope.frame.titleVisible = false;
      }
      
      $scope.ready(function(){
        $scope.state.visible = true;
      });
      
      if (!$scope.frame) Alert.error(Const.frameNotAvailable);
    }  
    
  });
  
}]);