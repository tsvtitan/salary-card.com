
app.controller('pageForm',['$scope','Page','Utils',
                           function($scope,Page,Utils) {
  
  $scope.page = Page;
  $scope.frame = false;
  $scope.state = {visible:false};
  
  Page.frames(function(d){
      
    if (d.error) {
      $scope.ready(d.error);
    } else {
      
      $scope.frame = (Utils.isArray(d.frames) && !Utils.isEmpty(d.frames))?d.frames[0]:[];
      $scope.ready(function(){
        $scope.state.visible = true;
      });
    }  
    
  });
  
}]);