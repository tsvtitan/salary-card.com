
app.controller('frameActionTableAdd',['$scope','$element','$uibModal',
                                      'Dictionary','Utils','Log','Alert','Frame',
                                      function($scope,$element,$uibModal,
                                               Dictionary,Utils,Log,Alert,Frame) {
                                           
  $scope.dic = Dictionary.dic($element); 
  $scope.modalController = 'frameActionTableAddModal';
  
  $scope.execute = function() {
    
    if (Utils.isObject($scope.action) && Utils.isObject($scope.action.table)) {
      
      $scope.action.table.processing = true;
      
      Frame.get($scope.action.frame,function(d){
        
        $scope.action.table.processing = false;
        
        if (d.error) Alert.error(d.error);
        else {
          
          var instance = $uibModal.open({
            animation: true,
            templateUrl: $scope.modalController+'.html',
            controller: $scope.modalController,
            resolve: {
              dic: function() { return $scope.dic; },
              action: function() { return $scope.action; },
              frame: function() { return d.frame; }
            }
          });
        }
        
      });
      
      /*Alert.info($scope.action.table.name);
      
      instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
        Log.info('Selected: ' +$scope.selected);
      }, function () {
        Log.info('Canceled (');
      });*/
    } 
  }
  
}]);

app.controller('frameActionTableAddModal',['$scope','$uibModalInstance','dic','action','frame',
                                                'Utils','Alert','Dictionary',
                                                function($scope,$uibModalInstance,dic,action,frame,
                                                         Utils,Alert,Dictionary) {

  $scope.dic = dic;
  $scope.frame = frame;
  
  $scope.ok = function () {
    
    if (!action.executing) {
      
      action.executing = true;

      action.execute({item:$scope.selected.item},null,function(d){

        action.executing = false;

        if (d.error) {
          Alert.error(d.error);
        } else {
          $uibModalInstance.close($scope.selected.item);
        }
      });
    }
  }

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  }
  
  $scope.alert = function () {
    Alert.info('Info from dialog');
  }
}]);