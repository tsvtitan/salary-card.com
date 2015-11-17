"use strict";

var randomstring = require('randomstring');

function Utils() {}

Utils.prototype = {

  format: function(s,values) {

    function formatObj(s,values) {
      if (values) {
        values = typeof(values) === 'object' ? values : Array.prototype.slice.call(arguments, 1);

        if (typeof(s)==='string') {
          return s.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
              if (m == "{{") { return "{"; }
              if (m == "}}") { return "}"; }
              return values[n];
          });
        } else return s;
      } else return s;
    }

    if (util.isArray(values)) {
      var arr = _.clone(values);
      arr.unshift(s);
      for (var i in arr) {
        if (typeof(arr[i]) === 'object') {
          arr[i] = JSON.stringify(arr[i],null,' ');
        }
      }
      return util.format.apply(util,arr);
    } else {
      return formatObj(s,values);
    }
  },

  path2obj: function(obj,path,delim) {
    var items = path.split(delim);
    for (var i in items) {
      var o = obj[items[i]];
      if (o) {
        obj = o;
      } else {
        obj = null;
        break;
      }
    }
    return obj;
  },
  
  makeFilter: function(obj) {
      
    function setPathByObject(key,root,parent,delim) {

      for (var k1 in parent) {

        var v = parent[k1];
        var prefix = (key)?key.concat(delim):'';
        var path = prefix.concat(k1);

        if (_.isObject(v) && !_.isArray(v)) {

          setPathByObject(path,root,v,delim);

        } else {
          root[path] = v;
        }
      }
    }

    function setPathByArray(key,root,array,delim) {

      var temp = [];

      for (var k1 in array) {

        var v = array[k1];
        var o1 = {}

        if (_.isObject(v) && !_.isArray(v)) {

          setPathByObject(false,o1,v,delim);
        }
        temp.push(o1);
      }
      root[key] = temp;
    }

    var delim = '.';

    for (var k in obj) {

      var o = obj[k];
      if (_.isObject(o)) {

        if (k.toLowerCase()==='or' && _.isArray(o)) {

          setPathByArray(k,obj,o,delim);

        } else if (!_.isArray(o)) {

          setPathByObject(k,obj,o,delim);
          delete obj[k];
        }
      }
    }
    return obj;
  },

  clone: function(obj) {
    return _.clone(obj);
  },
  
  concat: function(obj) {
    
    if (_.isArray(obj)) {
      
      var ret = [];
      for (var i in obj) {
        ret = ret.concat(obj[i]);
      }
      return ret;
      
    } else return obj;
  },

  extend: function(obj1,obj2) {
    return _.extend(obj1,obj2 || {});
  },
  
  extendSeries: function(arr) {
    
    if (_.isArray(arr)) {
      
      var r = {};
      
      _.forEach(arr,function(a){
        r = _.extend(r,a || {});
      });
      
      return r;
      
    } else return arr;
  },
  
  remainKeys: function(arr,keys) {
    
    var self = this;
    
    function inKeys(k) {
      
      if (_.isArray(keys)) {
        
        return (keys.indexOf(k)!==-1);
        
      } else if (_.isObject(keys)) {
        
        for (var i in keys) {
          if (i===k) {
            return true;
          }
        }
      } else return (k===keys);
    }
    
    function remove(obj) {
      
      if (_.isObject(obj)) {
        
        var temp = [];
        
        for (var k1 in obj) {
          
          var o = obj[k1];
          
          if (_.isObject(o)) {
            obj[k1] = remove(o);
          } else if (!inKeys(k1)) {
            var k11 = self.toInteger(k1,false);
            if (!self.isInteger(k11))
              temp.push(k1);
          }
        }
        
        for (var k2 in temp) {
          delete obj[temp[k2]];
        }
      }
      return obj;
    }
    
    if (_.isArray(arr)) {
      for (var i in arr) {
        arr[i] = remove(arr[i]);
      }
    } else arr = remove(arr);
    
    return arr;
  },
  
  reject: function(item,result) {
    return _.reject(item,result);
  },

  filter: function(arr,result){
    return _.filter(arr,result);
  },
  
  find: function(arr,result) {
    return _.find(arr,result);
  },

  forEach: function(arr,result) {
    return _.forEach(arr,result);
  },

  isObject: function(obj) {
    return _.isObject(obj);
  },

  isArray: function(obj) {
    return _.isArray(obj);
  },

  isFunction: function(obj) {
    return _.isFunction(obj);
  },

  isDefined: function(obj) {
    return !_.isUndefined(obj);
  },

  isNumber: function(obj) {
    return _.isNumber(obj) && !_.isNaN(obj);
  },

  isString: function(obj) {
    return _.isString(obj);
  },
    
  isEmpty: function(obj) {

    if (_.isString(obj)) {
      
      return obj.trim()=='';
      
    } else if (_.isArray(obj)) {
      
      return obj.length===0;
      
    } else if (_.isObject(obj)) {
      
      return _.isEmpty(obj);
      
    } else return !(obj);
  },
  
  isBoolean: function(obj) {
    return !_.isBoolean(obj);
  },
  
  fileName: function(fullName) {
    
    if (_.isString(fullName)) {
      
      return fullName.substr(0,fullName.lastIndexOf('.')) || fullName;
      
    } else return fullName;
  },
  
  fileExtension: function(fullName) {
    
    if (_.isString(fullName)) {
      
      return fullName.substr((~-fullName.lastIndexOf('.') >>> 0) + 2);
      
    } else return fullName;
  },
  
  randomString: function(obj) {
    
    if (_.isObject(obj) || _.isNumber(obj)) {
      
      return randomstring.generate(obj);
      
    } else return obj;
 
  },
  
  randomNumber: function(min,max) {
    
    return Math.random() * (max - min) + min;
  },
  
  isInteger: function(obj) {
    
    return _.isNumber(obj) && (obj === +obj && obj === (obj|0));
  },
  
  toInteger: function(obj,def) {
    
    var ret = _.isString(obj)?obj:(obj?obj.toString():def);
    
    var r = parseInt(ret);
    if (this.isInteger(r)) {
      ret = r;
    }
    
    return ret;
  },
  
  isFloat: function(obj) {
    
    return _.isNumber(obj) && (obj === +obj && obj !== (obj|0));
  },
  
  toFloat: function(obj,def) {
    
    var ret = _.isString(obj)?obj:(obj?obj.toString():def);
    
    var r = parseFloat(ret);
    if (this.isNumber(r)) {
      ret = r;
    }
    
    return ret;
  } 

}

module.exports = function() {
  return new Utils();
};