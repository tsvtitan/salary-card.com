
app.controller('footer',['$rootScope','$scope','$state','$element','Auth','Dictionary',
                         function($rootScope,$scope,$state,$element,Auth,Dictionary){
  
  $scope.dic = Dictionary.dic($element);
  $scope.visible = false;
}]);