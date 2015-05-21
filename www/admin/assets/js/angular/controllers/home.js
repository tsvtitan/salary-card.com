
app.controller('home',['$rootScope','$scope','$element','$timeout',
                       'Dictionary','Const','Auth',
                       function($rootScope,$scope,$element,$timeout,
                                Dictionary,Const,Auth) {
  $scope.tryAuth();
  $scope.dic = Dictionary.dic($element);
  
  function init() {
    
    if (Auth.ready) {
      
      $scope.hideSpinner();
      
    } else 
      $scope.hideSpinner();
  }
  
  $scope.onInit(function(){
    init();
  });
  
  init();
  
}]);

