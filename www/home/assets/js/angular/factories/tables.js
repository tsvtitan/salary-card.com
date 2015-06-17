
app.factory('Tables',['$http','Urls','Utils','Dictionary','Payload','Const',
                      function($http,Urls,Utils,Dictionary,Payload,Const) {
  
  var factory = {
    
    get: function(d,result) {
      
      $http.post(Urls.tablesGet,Payload.get(d))
           .success(result)
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    },
    
    action: function(d,result) {
      
      $http.post(Urls.tablesAction,Utils.makeFormData(Payload.get(d)),{
                  headers: {'Content-Type':undefined},
                            transformRequest:angular.identity
                })
           .success(result)
           .error(function(d) { result({error:Dictionary.connectionFailed(d)}); });
    }
  }
  
  return factory;
  
}]);