
app.controller('404',['$scope','$element','Dictionary',
                      function($scope,$element,Dictionary){
  
  $scope.dic = Dictionary.dic($element);
  
}]);