
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
    
    var min = 1000;
    var value = min;
    
    if (Utils.isObject(duration) && Utils.isInteger(duration.value)) {
      
      value = duration.value;
      min = Utils.isInteger(duration.min)?duration.min:min;
      
    } else if (Utils.isInteger(duration)) value = duration;
    else value = false;
    
    if (value) {
      
      if (value<min) value = min;
      
      return setTimeout(function(){
        
        res.json(obj);
        
      },value);
      
    } else return res.json(obj);
  }
}
