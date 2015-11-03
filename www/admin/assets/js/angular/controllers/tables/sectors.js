
app.controller('tableSectors',['$scope','Const','Alert','Utils',
                               function ($scope,Const,Alert,Utils) {
  
  $scope.table = ($scope.frame.isTable())?$scope.frame:null;
  
  if ($scope.table) {
    
    var grid = {
      "columnDefs":[
        {
          "headerName":"id",
          "field":"id",
          "hide":true
        },
        {
          "headerName":"Наименование2",
          "field":"title",
          "editable":true,
          "width":400,
          cellRenderer: {
            renderer: 'group',
            innerRenderer: function(params) {return params.data.title;}
          }
        },
        {
          "headerName":"Коэффициент",
          "field":"ratio",
          "editable":true,
          "width":100
        }
      ],
      "rowSelection":"single",
      "rowsAlreadyGrouped":true,
      "enableSorting":true,
      "pinnedColumnCount":0,
      "singleClickEdit":false,
      "suppressScrollLag":true,
      "enableColResize":true
    }

    $scope.table.grid = grid;
        
    $scope.table.load({},function(d){
      
      if (d.error) Alert.error(d.error);
      else {
        
        var data = Utils.isArray(d.data)?d.data:[];
        var rowData = [];
        
        function makeRowData(parent,items) {
          
          
          Utils.forEach(items,function(item){
            
            var r = {
              group: Utils.isArray(item.items) && item.items.length>0,
              data: {title:item.title, ratio:item.ratio}
            };
            
            if (r.group) {
              
              r.children = [];
              
              makeRowData(r.children,item.items);
            }
            
            parent.push(r);
          });
        }
        
        makeRowData(rowData,data);
        
        $scope.table.grid.api.setRowData(rowData);
        
        Alert.info('Sectors are loaded');
      }
    });
    
  } else Alert.error(Const.tableNotAvailable);
}]);