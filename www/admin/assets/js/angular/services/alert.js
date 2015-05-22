
app.service('Alert',['toastr','Utils','Dictionary','Const',
                     function(toastr,Utils,Dictionary,Const) {
    
    
  this.error = function(message,values,options) {
    
    var m = Dictionary.get(message,values);
    var t = Dictionary.get(Const.alertError);
    var o = Utils.clone(options);
    
    if (Utils.isObject(o)) {
      o.timeOut = (o.timeOut)?o.timeOut:Const.timeoutError;
    }
    
    toastr.error(m,t,o);  
  }
          
  this.info = function(message,values,options) {
    
    var m = Dictionary.get(message,values);
    var t = Dictionary.get(Const.alertInfo);
    var o = Utils.clone(options);
    
    if (Utils.isObject(o)) {
      o.timeOut = (o.timeOut)?o.timeOut:Const.timeoutInfo;
    }
    
    toastr.info(m,t,o);  
  }
  
  this.warning = function(message,values,options) {
    
    var m = Dictionary.get(message,values);
    var t = Dictionary.get(Const.alertWarning);
    var o = Utils.clone(options);
    
    if (Utils.isObject(o)) {
      o.timeOut = (o.timeOut)?o.timeOut:Const.timeoutWarning;
    }
    
    toastr.warning(m,t,o);  
  }
  
  
  this.success = function(message,values,options) {
    
    var m = Dictionary.get(message,values);
    var t = Dictionary.get(Const.alertSuccess);
    var o = Utils.clone(options);
    
    if (Utils.isObject(o)) {
      o.timeOut = (o.timeOut)?o.timeOut:Const.timeoutSuccess;
    }
    
    toastr.success(m,t,o);  
  }
 
    
}]);