
app.controller('signon',['$scope','$element',
                         'Dictionary','Auth','Init','Const',
                         function($scope,$element,
                                  Dictionary,Auth,Init,Const) {
  
  $scope.dic = Dictionary.dic($element);
  
  $scope.data = {
    login: '',
    pass: '',
    repeat: ''
  };
  
  $scope.state = {step:0}; 
  
  $scope.submit = function() {
    
    var self = this;
    var form = self.form;
    
    if (form.valid()) {
      
      
      $scope.state.step = $scope.state.step + 1;
      
    } else form.error(Const.checkFields);
  }
  
  $scope.back = function() {
    
    if ($scope.state.step>0)
      $scope.state.step = $scope.state.step - 1;
  }

  function init() {
    $scope.ready();
  } 
    
  init();
  
}]);

