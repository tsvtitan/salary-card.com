
app.controller('tableStrengthAdd',['$scope','$element',
                                   'Dictionary','Auth','Init',
                                   function($scope,$element,
                                            Dictionary,Auth,Init) {
  
  $scope.dic = Dictionary.dic($element);
  
  function init() {
    $scope.ready();
  } 
    
  init();
  
}]);