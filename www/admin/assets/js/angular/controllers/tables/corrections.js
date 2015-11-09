
app.controller('tableCorrections',['$scope','Const','Alert','Utils',
                                   function ($scope,Const,Alert,Utils) {
  
  $scope.table = ($scope.frame.isTable())?$scope.frame:null;
  
  if ($scope.table) {
    
    /*var grid = {
      "columnDefs":[
        {
          "headerName":"id",
          "field":"id",
          "hide":true
        },
        {
          "headerName":"Код",
          "field":"code",
          "editable":true,
          "width":100,
          "cellClass":"text-center"
        },
        {
          "headerName":"25",
          "field":"8_25",
          "headerGroup": "8",
          "editable":true,
          "width":50
        },
        {
          "headerName":"50",
          "field":"8_50",
          "headerGroup": "8",
          "editable":true,
          "width":50
        },
        {
          "headerName":"75",
          "field":"8_75",
          "headerGroup": "8",
          "editable":true,
          "width":50
        },
        {
          "headerName":"25",
          "field":"9_25",
          "headerGroup": "9",
          "editable":true,
          "width":50
        },
        {
          "headerName":"50",
          "field":"9_50",
          "headerGroup": "9",
          "editable":true,
          "width":50
        }
      ],
      "rowSelection":"single",
      "enableSorting":true,
      "pinnedColumnCount":0,
      "singleClickEdit":false,
      "suppressScrollLag":true,
      "enableColResize":true,
      "groupHeaders":true
    }

    $scope.table.grid = grid;*/
        
    $scope.table.load({},function(d){
      
      if (d.error) Alert.error(d.error);
      else {
        
        $scope.table.setData(d.data);
      }
    });
    
  } else Alert.error(Const.tableNotAvailable);
}]);