
app.controller('pageForm',['$scope','Page','Utils',
                           function($scope,Page,Utils) {
  
  $scope.page = Page;
  $scope.form = false;
  $scope.state = {visible:false};
  
  Page.frame(function(d){
      
    if (d.error) {
      $scope.ready(d.error);
    } else {
      
      $scope.form = Utils.isObject(d.frame)?d.frame:false;
      if ($scope.form) {
        $scope.form.titleVisible = false;
      }
      
      $scope.ready(function(){
        $scope.state.visible = true;
      });
    }  
    
  });
  
}]);