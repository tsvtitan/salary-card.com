// jsonError

module.exports = function jsonError (error,values,data,status) {

  var req = this.req;
  var res = this.res;
  
  if (Utils.isString(error)) {
    error = res.dic(error,values);  
  } if (error===undefined) {
    error = false;
  }
  
  var obj = {
    error: error
  }
  
  if (Utils.isObject(data)) {
    obj = Utils.extend(obj,data);
  }
  
  if (status==undefined) status = 200;
  
  if (req.options.jsonp && !req.isSocket) {
    
    return res.jsonp(obj,status);
    
  } else return (status)?res.status(status).json(obj):res.json(obj);
  
}