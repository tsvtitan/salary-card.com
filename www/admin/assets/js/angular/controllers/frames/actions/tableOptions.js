
app.controller('frameActionTableOptions',['$scope','$element','$uibModal',
                                          'Dictionary','Utils','Log',
                                          function($scope,$element,$uibModal,
                                                   Dictionary,Utils,Log) {
                                           
  $scope.items = ['item1', 'item2', 'item3'];
  $scope.dic = Dictionary.dic($element); 
  $scope.dialogController = 'frameActionTableOptionsDialog';
  
  $scope.execute = function() {
    
    if (Utils.isObject($scope.action)) {
      
      var instance = $uibModal.open({
        animation: true,
        templateUrl: $scope.dialogController+'.html',
        controller: $scope.dialogController,
        //size: 'sm',
        //windowClass: "animated fadeIn",
        resolve: {
          items: function () { return $scope.items; },
          action: function() { return $scope.action; },
          dic: function() { return $scope.dic; }
        }
      });
      
      instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
        Log.info('Selected: ' +$scope.selected);
      }, function () {
        Log.info('Canceled (');
      });
    } 
  }
  
}]);

app.controller('frameActionTableOptionsDialog',['$scope','$uibModalInstance','items','action','dic',
                                                'Utils','Alert','Dictionary',
                                                function($scope,$uibModalInstance,items,action,dic,
                                                         Utils,Alert,Dictionary) {

  $scope.items = items;
  $scope.dic = dic;
  $scope.action = action;
  
  $scope.selected = {
    item: $scope.items[0]
  };
  
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