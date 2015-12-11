
app.factory('Form',['$http','$q','Urls','Utils','Dictionary','Payload','Const','Alert','Log',
                     function($http,$q,Urls,Utils,Dictionary,Payload,Const,Alert,Log) {
  
  var factory = {
    
    get: function(d,result) {
      
      $http.post(Urls.formGet,Payload.get(d))
           .success(result)
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    }
  }

  function prepareForm(form) {
  
    if (!Utils.isFunction(form.load)) {
      
      form.load = function(options,result) {
        
        if (form.loading) {
          
          //Alert.info('Загрузка идет...');
                  
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
        }
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
      
      form.submit = function(fm) {
        Alert.info('submit submit');
        Log.debug(fm);
      }
    }
    
    if (!Utils.isFunction(form.click)) {
      
      form.click = function(action) {
        
        if (Utils.isObject(action)) {
          
          if (action.name==='submit') form.submit();
          else {
            Alert.info(action.name);
          }
        }
      }
    }
    
  }
                        
  factory.prepare = function(form) {
    prepareForm(form);
  }
    
  return factory;
  
}]);