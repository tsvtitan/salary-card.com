
app.controller('pageHome',['$scope','$element',
                           'Dictionary',
                           function($scope,$element,
                                    Dictionary) {
  $scope.dic = Dictionary.dic($element);
  
  function init() {
    $scope.ready();
  }  
  
  init();
  
}]);

