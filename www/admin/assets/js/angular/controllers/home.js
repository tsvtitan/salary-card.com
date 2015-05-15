
app.controller('home',['$scope','$element','Dictionary',
                       function($scope,$element,Dictionary) {
  $scope.tryAuth();
  $scope.dic = Dictionary.dic($element);
  
  function init() {
    $scope.hideSpinner();
  }
  
  $scope.$watch('ready',function(value){
    if (value) init();
  });
}]);

