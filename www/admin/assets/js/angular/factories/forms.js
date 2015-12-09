
app.factory('Forms',['$http','$q','Urls','Utils','Dictionary','Payload','Const','Alert',
                     function($http,$q,Urls,Utils,Dictionary,Payload,Const,Alert) {
  
  var factory = {
    
    get: function(d,result) {
      
      $http.post(Urls.formsGet,Payload.get(d))
           .success(result)
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    }
  }

  function prepareForm(form) {
  
    if (!Utils.isFunction(form.load)) {
      
      form.load = function(options,result) {
        
        if (form.loading) {
          
          //Alert.info('Загрузка идет...');
                  
        } else {
          
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
    
  }
                        
  factory.prepare = function(form) {
    prepareForm(form);
  }
    
  return factory;
  
}]);