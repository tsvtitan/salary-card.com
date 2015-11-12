
app.factory('Charts',['$http','$q','Urls','Utils','Dictionary','Payload','Const','Alert',
                      function($http,$q,Urls,Utils,Dictionary,Payload,Const,Alert) {
  
  var factory = {
    
    get: function(d,result) {
      
      $http.post(Urls.chartsGet,Payload.get(d))
           .success(result)
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    },
    
    action: function(d,result) {
      
      $http.post(Urls.chartsAction,Utils.makeFormData(Payload.get(d)),{
                  headers: {'Content-Type':undefined},
                            transformRequest:angular.identity
                })
           .success(result)
           .error(function(d) { result({error:Dictionary.connectionFailed(d)}); });
    }
  }

  function prepareChart(chart) {
  
    function executeAction(name,params,files,result) {
      
      function execute() {

        var deferred = $q.defer();
        var data = {
          name: chart.name,
          action: name,
          params: params,
          files: files
        };

        factory.action(data,function(d){
          deferred.resolve(d);
        });

        return deferred.promise;
      }

      chart.processing = true;

      execute().then(function(d){

        chart.processing = false;

        if (d.error) {

          if (Utils.isFunction(result)) result(d);
          else Alert.error(d.error);

        } else if (d.reload) {

          chart.reload(result);

        } else if (Utils.isFunction(result)) result(d);

      });
    }
    
    function prepareAction(action) {
      
      action.chart = chart;
      
      if (!Utils.isFunction(action.execute)) {
        
        action.execute = function(params,files,result) {
          executeAction(action.name,params,files,result);
        };
      }
    }
    
    if (Utils.isArray(chart.actions)) {
    
      Utils.forEach(chart.actions,function(action){
        prepareAction(action);
      });
    }
    
    if (!Utils.isFunction(chart.load)) {
      
      chart.load = function(options,result) {
        
        chart.loading = true;
        chart.loadCallback = undefined;
        
        factory.get({name:chart.name,options:options},function(d){
          
          chart.options = options;
          
          if (Utils.isFunction(result)) {
            
            chart.loadCallback = result;
            result(d);
            
          } else {
            
            if (d.error) Alert.error(d.error);
            else {
              //chart.setData(d.data);
            }
          } 
          
          chart.loading = false;
        });
      }
    }
    
    if (!Utils.isFunction(chart.reload)) {
      
      chart.reload = function(result) {
        
        chart.load(chart.options,result || chart.loadCallback);
      }
    }
    
  }
                        
  factory.prepare = function(chart) {
    prepareChart(chart);
  }
    
  return factory;
  
}]);