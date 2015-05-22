
app.controller('home',['$rootScope','$state','$scope','$element','$timeout',
                       'Dictionary','Const','Auth','Init',
                       function($rootScope,$state,$scope,$element,$timeout,
                                Dictionary,Const,Auth,Init) {
  function init() {
    $scope.dic = Dictionary.dic($element);
    
    $timeout(function(){
      $scope.hideSpinner();
    },1000);
    
  } 
  
  Init.once('home',function(){
    
    Auth.onLogin(function(){
      init();
    });
    
    init();
  });
  
  
}]);

