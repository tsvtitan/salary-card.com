
module.exports = function jsonSuccess (data,duration) {
  
  var req = this.req;
  var res = this.res;
  
  var obj = {
    error: false
  }
  
  if (Utils.isObject(data)) {
    obj = Utils.extend(obj,data);
  }
  
  if (req.options.jsonp && !req.isSocket) {
   
    return res.jsonp(obj);
    
  } else {
    
    var max = 1000;
    
    if (Utils.isObject(duration) && Utils.isInteger(duration.max)) max = duration.max;
    
    if ((Utils.isInteger(duration) && duration<max) || 
        (Utils.isObject(duration) && Utils.isInteger(duration.value) && duration.value<max)) {
      
      return setTimeout(function(){
        
        res.json(obj);
        
      },max);
      
    } else return res.json(obj);
  }
}
