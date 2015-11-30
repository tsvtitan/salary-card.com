
app.controller('form',['$scope','$element','Const','Alert','Dictionary',
                        function($scope,$element,Const,Alert,Dictionary){
  
  $scope.form = ($scope.frame.isForm())?$scope.frame:null;
  $scope.dic = Dictionary.dic($element,$scope.frame.controllerName);
  
  if ($scope.form) {
  
    $scope.form.load({});
    
  } else Alert.error(Const.formNotAvailable);
  
}]);