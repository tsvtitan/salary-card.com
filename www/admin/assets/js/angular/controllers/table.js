
app.controller('table',['$scope','table','Const','Alert','Utils',
                        function($scope,table,Const,Alert,Utils){
  
  if (table) {
  
    table.load({});
    
  } else Alert.error(Const.tableNotAvailable);
  
}]);