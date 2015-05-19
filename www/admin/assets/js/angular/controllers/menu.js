
app.controller('menu',['$rootScope','$scope','$state','$element','$window',
                       'Auth','Dictionary',
                       function($rootScope,$scope,$state,$element,$window,
                                Auth,Dictionary){
  
  $scope.dic = Dictionary.dic($element);
  
  
  /*$scope.$watch(function(){
    return $window.innerHeight;
  },function(v1,v2){
    if (v1!==v2) {
      fix_height();
    }
  });*/
  
}]);