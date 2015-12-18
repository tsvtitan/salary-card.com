
app.factory('Form',['$http','$q','$rootScope',
                    'Urls','Utils','Dictionary','Payload','Const','Alert',
                     function($http,$q,$rootScope,
                              Urls,Utils,Dictionary,Payload,Const,Alert) {
  
  var factory = {
    
    get: function(d,result) {
      
      $http.post(Urls.formGet,Payload.get(d))
           .success(result)
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    },
    
    action: function(action,result) {

      $http.post(Urls.formAction,Utils.makeFormData(Payload.get({action:action})),{
                  headers: {'Content-Type':undefined},
                            transformRequest:angular.identity
                })
           .success(result)
           .error(function(d) { result({error:Dictionary.connectionFailed(d)}); });      
    }
  }

  function prepareForm(form) {
  
    if (!Utils.isFunction(form.load)) {
      
      form.load = function(options,result) {
        
        if (form.loading) {
          
          Alert.warning(Const.formLoading);
                  
        } else if (form.canLoad) {
          
          var opts = options || {};
          
          form.loading = true;
          form.loadCallback = undefined;

          factory.get({name:form.name,options:opts},function(d){

            form.loadOptions = opts;

            if (Utils.isFunction(result)) {

              form.loadCallback = result;
              result(d);

            } else {

              if (d.error) Alert.error(d.error);
              else {
                //form.setData(d.data);
              }
            } 

            form.loading = false;
          });
        } else if (Utils.isFunction(result)) result({});
      }
    }
    
    if (!Utils.isFunction(form.reload)) {
      
      form.reload = function(result) {
        
        form.load(form.loadOptions,result || form.loadCallback);
      }
    }
    
    if (!Utils.isFunction(form.toggle)) {
      
      form.toggle = function() {
        form.collapsed = !form.collapsed;
      }
    }
    
    if (!Utils.isFunction(form.submit)) {
      
      form.submit = function(data,result) {
        
        if (form.processing) {
          
          Alert.warning(Const.formProcessing);
          
        } else {
          
          form.processing = true;
          
          var action = {
            name: 'submit',
            entity: form.name,
            params: data
          };
        
          factory.action(action,function(d){
            
            if (!d.error) { 
              
              var a = Utils.findWhere(form.actions,{name:action.name});
              
              var event = (form.event)?form.event:((a && a.event)?a.event:action.entity);
              $rootScope.$broadcast(event,d);
            }
              
            if (Utils.isFunction(result)) {
              result(d);
            } else {
              if (d.error) Alert.error(d.error);
            }

            form.processing = false;
          });
          
        }
      }
    }
    
  }
                        
  factory.prepare = function(form) {
    prepareForm(form);
  }
    
  return factory;
  
}]);