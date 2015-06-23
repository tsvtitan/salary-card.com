
app.controller('footer',['$scope','$element','Dictionary',
                            function($scope,$element,Dictionary){
  
  $scope.dic = Dictionary.dic($element);
  
}]);