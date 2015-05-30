
app.controller('home',['$rootScope','$state','$scope','$element','$timeout',
                       'Dictionary','Const','Auth','Init',
                       function($rootScope,$state,$scope,$element,$timeout,
                                Dictionary,Const,Auth,Init) {
  $scope.dic = Dictionary.dic($element);
  
  function init() {
    $scope.ready();
  }  
  
  init();
  
}]);

