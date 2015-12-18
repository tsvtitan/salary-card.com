
app.factory('Chart',['$http','$q','Urls','Utils','Dictionary','Payload','Const','Alert',
                      function($http,$q,Urls,Utils,Dictionary,Payload,Const,Alert) {
  
  var factory = {
    
    data: function(d,result) {
      
      $http.post(Urls.chartData,Payload.get(d))
           .success(result)
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    },
    
    action: function(action,result) {
      
      $http.post(Urls.chartAction,Utils.makeFormData(Payload.get({action:action})),{
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
        var action = {
          name: name,
          entity: chart.name,
          params: params,
          files: files
        };

        factory.action(action,function(d){
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
    
    if (Utils.isObject(chart.options)) {
      
      function convertTo(type,value,def) {
        
        switch (type) {
          
          case 'float': return Utils.toFloat(value,def);          
          case 'integer': return Utils.toInteger(value,def); 
          case 'date': return Utils.toDate(value,def);
          case 'string': return value;
        }
        return (def)?def:value;
      }
      
      if (Utils.isObject(chart.options.chart)) {
        
        var ch = chart.options.chart;
        
        if (!Utils.isFunction(ch.x)) {
          
          var x = (ch.x)?ch.x:0;
          ch.x = function(d) {
            //return (ch.xType)?convertTo(ch.xType,d[x]):d[x];
            return d[x];
          }
        }
        
        if (!Utils.isFunction(ch.y)) {
          
          var y = (ch.y)?ch.y:1;
          ch.y = function(d) {
            //return (ch.yType)?convertTo(ch.yType,d[y]):d[y];
            return d[y];
          }
        }
        
        if (!Utils.isFunction(ch.valueFormat) && ch.valueFormat) {
          
          var valueFormat = Utils.isString(ch.valueFormat)?ch.valueFormat:false;
          if (valueFormat) {
            ch.valueFormat = function(d) {
              return Utils.format(valueFormat,d,ch.xType);
            }
          }
        }
        
        function setTickFormat(obj,dataType) {
          
          if (Utils.isObject(obj)) {
          
            if (!Utils.isFunction(obj.tickFormat) && obj.tickFormat) {

              var tickFormat = Utils.isString(obj.tickFormat)?obj.tickFormat:false;
              if (tickFormat) {
                obj.tickFormat = function(d) {
                  return Utils.format(tickFormat,d,dataType);
                }
              }
            }
          }
        }
        
        setTickFormat(ch.xAxis,ch.xType);
        setTickFormat(ch.yAxis,ch.yType);
        setTickFormat(ch.yAxis1,ch.yType);
        setTickFormat(ch.yAxis2,ch.yType);
        setTickFormat(ch.x2Axis,ch.xType);
        setTickFormat(ch.y2Axis,ch.yType);
      }
      
    }
    
    if (!Utils.isFunction(chart.setData)) {
      
      chart.setData = function(data) {
        
        //chart.data = Utils.isArray(data)?data:[];
        chart.api.updateWithData(Utils.isArray(data)?data:[]);
      }
    }
    
    if (!Utils.isFunction(chart.load)) {
      
      chart.load = function(options,result) {
        
        if (chart.loading) {
          
          //Alert.info('Загрузка идет...');
                  
        } else if (chart.canLoad) {
          
          var opts = options || {};
          
          chart.loading = true;
          chart.loadCallback = undefined;

          factory.data({name:chart.name,options:opts},function(d){

            chart.loadOptions = opts;

            if (Utils.isFunction(result)) {

              chart.loadCallback = result;
              result(d);

            } else {

              if (d.error) Alert.error(d.error);
              else {
                chart.setData(d.data);
              }
            } 

            chart.loading = false;
          });
        } else if (Utils.isFunction(result)) result({});
      }
    }
    
    if (!Utils.isFunction(chart.reload)) {
      
      chart.reload = function(result) {
        
        chart.load(chart.loadOptions,result || chart.loadCallback);
      }
    }
    
    if (!Utils.isFunction(chart.toggle)) {
      
      chart.toggle = function() {
        chart.collapsed = !chart.collapsed;
      }
    }
    
    
    if (Utils.isArray(chart.actions)) {
    
      Utils.forEach(chart.actions,function(action){
        prepareAction(action);
      });
    }
  }
                        
  factory.prepare = function(chart) {
    prepareChart(chart);
  }
    
  return factory;
  
}]);