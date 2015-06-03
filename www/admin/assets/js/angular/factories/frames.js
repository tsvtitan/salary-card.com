
app.factory('Frames',['$http','Urls','Dictionary','Payload','Const',
                      function($http,Urls,Dictionary,Payload,Const) {

  var factory = {
    
    get: function(d,result) {
      
      $http.post(Urls.framesGet,Payload.get(d))
           .success(result)
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    }
  }
  
  return factory;
  
}]);  
  