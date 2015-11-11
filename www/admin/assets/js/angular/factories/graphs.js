
app.factory('Graphs',['$http','$q','Urls','Utils','Dictionary','Payload','Const','Alert',
                      function($http,$q,Urls,Utils,Dictionary,Payload,Const,Alert) {
  
  var factory = {
    
    get: function(d,result) {
      
      $http.post(Urls.graphsGet,Payload.get(d))
           .success(result)
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    },
    
    action: function(d,result) {
      
      $http.post(Urls.graphsAction,Utils.makeFormData(Payload.get(d)),{
                  headers: {'Content-Type':undefined},
                            transformRequest:angular.identity
                })
           .success(result)
           .error(function(d) { result({error:Dictionary.connectionFailed(d)}); });
    }
  }

  function prepareGraph(graph) {
  
    function executeAction(name,params,files,result) {
      
      function execute() {

        var deferred = $q.defer();
        var data = {
          name: graph.name,
          action: name,
          params: params,
          files: files
        };

        factory.action(data,function(d){
          deferred.resolve(d);
        });

        return deferred.promise;
      }

      graph.processing = true;

      execute().then(function(d){

        graph.processing = false;

        if (d.error) {

          if (Utils.isFunction(result)) result(d);
          else Alert.error(d.error);

        } else if (d.reload) {

          graph.reload(result);

        } else if (Utils.isFunction(result)) result(d);

      });
    }
    
    function prepareAction(action) {
      
      action.graph = graph;
      
      if (!Utils.isFunction(action.execute)) {
        
        action.execute = function(params,files,result) {
          executeAction(action.name,params,files,result);
        };
      }
    }
    
    if (Utils.isArray(graph.actions)) {
    
      Utils.forEach(graph.actions,function(action){
        prepareAction(action);
      });
    }
    
    if (!Utils.isFunction(graph.load)) {
      
      graph.load = function(options,result) {
        
        graph.loading = true;
        graph.loadCallback = undefined;
        
        factory.get({name:graph.name,options:options},function(d){
          
          graph.options = options;
          
          if (Utils.isFunction(result)) {
            
            graph.loadCallback = result;
            result(d);
            
          } else {
            
            if (d.error) Alert.error(d.error);
            else {
              //graph.setData(d.data);
            }
          } 
          
          graph.loading = false;
        });
      }
    }
    
    if (!Utils.isFunction(graph.reload)) {
      
      graph.reload = function(result) {
        
        graph.load(graph.options,result || graph.loadCallback);
      }
    }
    
  }
                        
  factory.prepare = function(graph) {
    prepareGraph(graph);
  }
    
  return factory;
  
}]);