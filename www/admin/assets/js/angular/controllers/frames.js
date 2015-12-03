
app.controller('pageFrames',['$scope','Page','Utils',
                             function($scope,Page,Utils){
  
  $scope.page = Page;
  $scope.frames = [];
  $scope.state = {visible:false};
  
  Page.frames(function(d){
      
    if (d.error) {
      $scope.ready(d.error);
    } else {
      
      $scope.frames = Utils.isArray(d.frames)?d.frames:[];
      $scope.ready(function(){
        $scope.state.visible = true;
      });
    }  
    
  });
  
}]);