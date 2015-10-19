
var stackTrace = require('stack-trace');

function Log() {}

Log.prototype = {

  info: function(s,values) {
    sails.log.info(Utils.format(s,values));
  },

  error: function(s,values) {
    sails.log.error(Utils.format(s,values));
  },

  warn: function(s,values) {
    sails.log.warn(Utils.format(s,values));
  },

  debug: function(s,values) {
    sails.log.debug(Utils.format(s,values));
  },

  exception: function(e) {
    sails.log.error(e.message);
  },
  
  trace: function(name,offset,extra) {
    
    var offset = (offset)?offset+1:1;
    
    function removePhrase(s,phrase) {
      var s1 = s.substring(0,phrase.length);
      if (s1===phrase) {
        return s.substring(s1.length);
      } else return s;
    }
    
    function getTrace(traces,extra) {

      var trace = null;
      var prefix = true;
      
      var exp1 = new RegExp('^'+sails.config.appPath+'+');
      var exp2 = new RegExp('^'+sails.config.appPath+'/node_modules+');
      
      var temp = []
      for (var i=0; i<traces.length; i++) {
        var t = traces[i];
        if (t) {
          var f = (t.methodName)?t.methodName:t.functionName;
          if (exp1.test(t.fileName) && !exp2.test(t.fileName) && f) {
            t.phrase = removePhrase(f,'module.exports.');
            temp.push(t);
          }
        }
      } 
      
      if (!Utils.isEmpty(temp)) {
        
        var apiPath = sails.config.appPath+'/api/';
        var exp3 = new RegExp('^'+apiPath+'+');
        
        if (temp.length>offset) {

          var t = temp[offset];
          trace = (!extra)?Utils.format('.%s',[t.phrase]):Utils.format('.%s (%s, %d)',[t.phrase,t.fileName,t.lineNumber]);
          
          if (exp3.test(t.fileName)) {
            
            name = removePhrase(t.fileName,apiPath);
            name = Utils.fileName(name);
            prefix = false;
          }

        }
      }
      
      return (trace)?{name:name,trace:trace,prefix:prefix}:null;
    }
    
    var traces = stackTrace.parse(new Error());
    if (traces && traces.length>0) {
      
      return getTrace(traces,extra);
      
    } return null;
  },
  
  prepare: function(prefix,name,suffix,s,values,trace,offset,extra) {
    
    var pr = (prefix)?prefix+'/':'';
    var sf = (suffix)?suffix:'';
    var t = {name:name,trace:'',prefix:true};
    if (trace) {
      t = this.trace(name,(offset)?offset+1:1,extra) || t;
    }
    
    return Utils.format('[%s%s%s%s] => %s',[(t.prefix)?pr:'',t.name,sf,t.trace,Utils.format(s,values)]);
  },
  
  infoTrace: function(s,values,offset,extra) {
    
    this.info(this.prepare(null,null,null,s,values,true,(offset)?offset+1:1,extra));
  },
  
  debugTrace: function(s,values,offset,extra) {
    
    this.debug(this.prepare(null,null,null,s,values,true,(offset)?offset+1:1,(extra)?extra:true));
  },
  
  errorTrace: function(s,values,offset,extra) {
    
    this.error(this.prepare(null,null,null,s,values,true,(offset)?offset+1:1,(extra)?extra:true));
  },
  
  warnTrace: function(s,values,offset,extra) {
    
    this.warn(this.prepare(null,null,null,s,values,true,(offset)?offset+1:1,extra));
  },
  
  exceptionTrace: function(e,offset) {
    
    this.warn(this.prepare(null,null,null,e.message,null,true,(offset)?offset+1:1,true));
  },
  
  extend: function(obj,prefix,name,suffix,method) {
  
    if (obj.log) {
      return obj;
    }

    var name = (name)?name:obj.constructor.name;
    var self = this;
    var def = 1;
    
    var ext = {

      log: {

        debug: function(s,values,offset) {
          self.debug(self.prepare(prefix,name,suffix,s,values,true,(offset)?offset+def:def,true));
        },

        error: function(s,values,offset) {
          self.error(self.prepare(prefix,name,suffix,s,values,true,(offset)?offset+def:def,true));
        },

        info: function(s,values,offset) {
          self.info(self.prepare(prefix,name,suffix,s,values,true,(offset)?offset+def:def,false));
        },

        warn: function(s,values,offset) {
          self.warn(self.prepare(prefix,name,suffix,s,values,true,(offset)?offset+def:def,false));
        },

        exception: function(e,offset) {
          self.warn(self.prepare(prefix,name,suffix,e.message,null,true,(offset)?offset+def:def,true));
        }
      }
    }

    return Utils.extend(obj,ext);
  }
}

module.exports = function() {
  
  return new Log();
}