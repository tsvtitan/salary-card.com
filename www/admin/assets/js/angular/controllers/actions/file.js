

app.controller('actionFile',['$state','$scope','$element','$timeout',
                             'Dictionary','Const','Auth','Init',
                             function($state,$scope,$element,$timeout,
                                      Dictionary,Const,Auth,Init) {
  $scope.dic = Dictionary.dic($element);
  
  $scope.recipientsChange = function(files) {
    
    if (files) {
      if (files.length>1) {
        $scope.recipientsValue = $scope.dic(Const.countFileSelected,{count:files.length});
      } else $scope.recipientsValue = (files.length>0)?files[0].name:'';
    } else $scope.recipientsValue = '';
    $scope.data.recipients = files;
    $scope.data.menu = '';
  }
  
}]);