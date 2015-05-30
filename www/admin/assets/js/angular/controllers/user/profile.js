
app.controller('profile',['$scope','$element',
                          'Dictionary','Auth','Init',
                          function($scope,$element,
                                   Dictionary,Auth,Init) {
  function init() {
    $scope.dic = Dictionary.dic($element);
    $scope.hideSpinner();
  } 
  
  Init.once('profile',function(){
    
    Auth.onLogin(function(){
      init();
    });
    
    init();
  });
  
}]);

