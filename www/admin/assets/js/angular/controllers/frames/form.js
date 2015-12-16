
app.controller('frameForm',['$scope','Const','Alert','Form',
                            function($scope,Const,Alert,Form){
  
  if ($scope.form) {
  
    $scope.submit = function() {
      $scope.form.submit(this[$scope.form.name]);
    }
    
    /*$scope.cancel = function(a) {
      
      if (a.executing) Alert.warning(Const.formProcessing);
      else {  
        
        a.executing = true;

        var action = {
          name: a.name,
          entity: $scope.form.name,
          prefix: true,
          params: this[$scope.form.name]
        };

        Form.action(action,function(d){

          a.executing = false;

          if (d.error) Alert.error(d.error);
          else Alert.info(action.name);
        });
      }
    }*/

    $scope.form.load({});
    
  } else Alert.error(Const.formNotAvailable);
  
  
}]);