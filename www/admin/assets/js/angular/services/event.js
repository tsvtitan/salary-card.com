
app.service('Event',['Dictionary','Log','Utils',
                     function(Dictionary,Log,Utils) {
  
  
  var events = {};
  
  function getError(d,raw) {
    
    var error = false;
    if (raw.statusCode) {
      error = (raw.statusCode===200)?false:d;
    }
    return error;
  }
  
  function post(path,data,result) {
    return io.socket.post(path,data,result);
  }
  
  function on(event,result) {
    return io.socket.on(event,result);
  }
  
  function remote(event,path,data,onEvent,result) {
    
    Log.debug('Remote event %s is registering...',[event]);
    
    /*return post(path,data,function(data,raw){
      
      var error = getError(data,raw);
      if (!error) {
        
        if (!events[event]) {
          
          if (onEvent) {
            on(event,function(d){
              //Log.write(d);
              onEvent(d);
            });
            events[event] = {remote:{path:path,data:data}};
            Log.debug('Event %s is registered',[event]);
          }
        }
        if (result) result({error:false});
        
      } else {
        
        Log.error(error);
        if (result) result({error:Dictionary.couldNotSubscribeOnEvent()});
      } 
    });*/
  }
  this.remote = remote;
  
  this.local = function(event,onEvent) {
    
    //Log.debug('Local event %s is registering...',[event]);
    
    var e = events[event];
    if (!e) {
      e = {locals:[]};
      events[event] = e;
    } else if (!e.locals) {
      e.locals = [];
    }
    
    var local = Utils.findWhere(e.locals,{on:onEvent});
    if (!local) {
      e.locals.push({
        on: onEvent
      });
    }
    
    //Log.debug('Local event %s is registered',[event]);
  }
  
  this.publish = function(event,data,result) {
    
    var e = events[event];
    if (e) {
      
      if (e.locals) {
        
        Utils.forEach(e.locals,function(local){
          
          if (Utils.isFunction(local.on))
            local.on(data);
        });
      }
      
      if (e.remotes) {
        
        Utils.forEach(e.remotes,function(remote){
          
          post(remote.path,data,result);
        });
      }
    }
  }
  
  function unsubscribe(event,path,data,result) {
    
    //Log.debug('Event %s is unregistering...',[event]);
    
    var e = events[event];
    if (e) {
      
      if (e.remotes) {
        /*return post(path,data,function(data,raw){

          var error = getError(data,raw);
          if (error) Log.error(error);
          else {
            delete events[event];
            Log.debug('Event %s is unregistered',[event]);
          }

          if (result) result({error:(error)?Dictionary.couldNotUnsubscribeFromEvent():false});
        });*/
        
      } else if (e.locals) {
        
        delete e.locals;
      }
    } else if (result) result({error:Dictionary.couldNotUnsubscribeFromEvent()});
  }
  this.unsubscribe = unsubscribe;
  
  on('connect',function(){
    
    for (var k in events) {
      var e = events[k];
      if (e.remote) {
        remote(k,e.remote.path,e.remote.data);
      }
    }
  });
  
    
}]);
