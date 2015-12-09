
app.controller('frameActionFile',['$scope','$element','Dictionary','Utils',
                                  function($scope,$element,Dictionary,Utils) {
  
  $scope.dic = Dictionary.dic($element);        
  
  $scope.execute = function(files) {
    
    if (files && !Utils.isEmpty(files) && Utils.isObject($scope.action)) {
      $scope.action.execute(null,files);
    } 
  }
  
}]);