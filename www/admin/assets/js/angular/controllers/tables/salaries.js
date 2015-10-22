
app.controller('tableSalaries',['$scope','$element',
                                'Dictionary','Auth','Init',
                                function($scope,$element,
                                         Dictionary,Auth,Init) {
  
  $scope.dic = Dictionary.dic($element);
  
  var columnDefs = [
      {headerName: "Make", field: "make"},
      {headerName: "Model", field: "model"},
      {headerName: "Price", field: "price"}
  ];

  var rowData = [
      {make: "Toyota", model: "Celica", price: 35000},
      {make: "Ford", model: "Mondeo", price: 32000},
      {make: "Porsche", model: "Boxter", price: 72000}
  ];

  $scope.gridOptions = {
      columnDefs: columnDefs,
      rowData: rowData
  };
    
  function init() {
    $scope.ready();
  } 
    
  init();
  
}]);
