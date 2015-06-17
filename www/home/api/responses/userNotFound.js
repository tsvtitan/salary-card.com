
module.exports = function userNotFound (error,values) {

  var req = this.req;
  var res = this.res;
  
  var message = 'User is not found';
  var error = (error)?error:message;
  
  Log.errorTrace(error,values,1);
      
  return res.jsonError(message);
  
}