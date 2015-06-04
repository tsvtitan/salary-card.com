
app.factory('Tables',['$http','Urls','Utils','Dictionary','Payload','Const',
                      function($http,Urls,Utils,Dictionary,Payload,Const) {
  
  var factory = {
    
    get: function(d,result) {
      
      $http.post(Urls.tablesGet,Payload.get(d))
           .success(result)
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    }
  }
  
  return factory;
  
}]);