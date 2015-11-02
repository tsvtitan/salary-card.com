
app.controller('tableSectors',['$scope','table','Const','Alert','Utils',
                               function ($scope,table,Const,Alert,Utils) {
  
  if (table) {
  
    table.load({},function(d){
      
      if (d.error) Alert.error(d.error);
      else {
        table.grid.api.setRowData(Utils.isArray(d.data)?d.data:[]);
      }
    });
    
  } else Alert.error(Const.tableNotAvailable);
}]);