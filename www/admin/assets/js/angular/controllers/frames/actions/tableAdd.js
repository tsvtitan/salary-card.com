
app.controller('frameActionTableAdd',['$scope','$element','$uibModal',
                                      'Dictionary','Utils','Const','Alert','Frame',
                                      function($scope,$element,$uibModal,
                                               Dictionary,Utils,Const,Alert,Frame) {
                                           
  $scope.dic = Dictionary.dic($element); 
  $scope.modalController = 'frameActionTableAddModal';
  
  $scope.execute = function() {
    
    if (Utils.isObject($scope.action) && Utils.isObject($scope.action.table)) {
      
      var instance = $uibModal.open({
        animation: true,
        templateUrl: $scope.modalController+'.html',
        controller: $scope.modalController,
        resolve: {
          dic: function() { return $scope.dic; },
          action: function() { return $scope.action; }
        }
      });
      
      instance.result.then(function(d){

        if (!d.error) {
          //
        } 
      });
      
      /*Frame.get($scope.action.frame,function(d){
        
        $scope.action.table.processing = false;
        
        if (d.error) Alert.error(d.error);
        else {
          
          if (d.frame) {
            
            var instance = $uibModal.open({
              animation: true,
              templateUrl: $scope.modalController+'.html',
              controller: $scope.modalController,
              resolve: {
                dic: function() { return $scope.dic; },
                form: function() { return d.frame; }
              }
            });

            instance.result.then(function(d){

              if (!d.error) {
                //if (d.reload) $scope.action.table.reload();
              } 
            });
            
          } else Alert.error(Const.frameNotAvailable);
        }
      });*/
    } 
  }
  
}]);

app.controller('frameActionTableAddModal',['$scope','$uibModalInstance','dic','action',
                                           'Const','Alert','Utils','Frame',
                                           function($scope,$uibModalInstance,dic,action,
                                                    Const,Alert,Utils,Frame) {

  $scope.dic = dic;
  
  Frame.get(action.frame,function(d){
              
    if (d.error) Alert.error(d.error);
    else {
      
      if (d.frame) {
        
        $scope.form = d.frame;
        
        Utils.findWhere($scope.form.actions,{name:'cancel'}) || $scope.form.actions.push({name:'cancel',title:Const.cancel});

        $scope.submit = function() {

          $scope.form.submit(this[$scope.form.name],function(d){

            if (d.error) Alert.error(d.error);
            else $uibModalInstance.close(d);
          });
        }

        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        }
        
        $scope.form.load({});

      } else Alert.error(Const.formNotAvailable);
    }
  });
   
}]);