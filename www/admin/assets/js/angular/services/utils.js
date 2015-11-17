
app.service('Utils',['base64',
                     function(base64) {

  function formatObj(s,values) {
    
    if (values) {
      values = typeof(values) === 'object' ? values : Array.prototype.slice.call(arguments, 1);

      if (typeof(s)==='string') {
        return s.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
            if (m == "{{") { return "{"; }
            if (m == "}}") { return "}"; }
            return (values[n])?values[n]:'';
        });
      } else return s;
    } else return s;
  }
  
  // https://code.google.com/p/javascript-number-formatter/source/browse/format.js
  function formatNumber(m,v) {
    
    if (!m || isNaN(+v)) {
        return v; //return as it is.
    }
    //convert any string to number according to formation sign.
    var v = m.charAt(0) == '-'? -v: +v;
    var isNegative = v<0? v= -v: 0; //process only abs(), and turn on flag.
    
    //search for separator for grp & decimal, anything not digit, not +/- sign, not #.
    var result = m.match(/[^\d\-\+#]/g);
    var Decimal = (result && result[result.length-1]) || '.'; //treat the right most symbol as decimal 
    var Group = (result && result[1] && result[0]) || ',';  //treat the left most symbol as group separator
    
    //split the decimal for the format string if any.
    var m = m.split( Decimal);
    //Fix the decimal first, toFixed will auto fill trailing zero.
    v = v.toFixed( m[1] && m[1].length);
    v = +(v) + ''; //convert number to string to trim off *all* trailing decimal zero(es)

    //fill back any trailing zero according to format
    var pos_trail_zero = m[1] && m[1].lastIndexOf('0'); //look for last zero in format
    var part = v.split('.');
    //integer will get !part[1]
    if (!part[1] || part[1] && part[1].length <= pos_trail_zero) {
        v = (+v).toFixed( pos_trail_zero+1);
    }
    var szSep = m[0].split( Group); //look for separator
    m[0] = szSep.join(''); //join back without separator for counting the pos of any leading 0.

    var pos_lead_zero = m[0] && m[0].indexOf('0');
    if (pos_lead_zero > -1 ) {
        while (part[0].length < (m[0].length - pos_lead_zero)) {
            part[0] = '0' + part[0];
        }
    }
    else if (+part[0] == 0){
        part[0] = '';
    }
    
    v = v.split('.');
    v[0] = part[0];
    
    //process the first group separator from decimal (.) only, the rest ignore.
    //get the length of the last slice of split result.
    var pos_separator = ( szSep[1] && szSep[ szSep.length-1].length);
    if (pos_separator) {
        var integer = v[0];
        var str = '';
        var offset = integer.length % pos_separator;
        for (var i=0, l=integer.length; i<l; i++) { 
            
            str += integer.charAt(i); //ie6 only support charAt for sz.
            //-pos_separator so that won't trail separator on full length
            if (!((i-offset+1)%pos_separator) && i<l-pos_separator ) {
                str += Group;
            }
        }
        v[0] = str;
    }

    v[1] = (m[1] && v[1])? Decimal+v[1] : "";
    return (isNegative?'-':'') + v[0] + v[1]; //put back any negation and combine integer and fraction.
  }
    
  this.format = function(s,values,type) {
    
    if (angular.isObject(s) || angular.isArray(s)) {
      return s;
    } else {
      
      if ((angular.isNumber(values) && !type) || (angular.isNumber(values) && (type==='float' || type==='integer'))) 
        return formatNumber(s,values);
      else if ((angular.isDate(values) && !type) || ((angular.isNumber(values) || angular.isString(values)) && type==='date')) 
        return moment(values).format(s);
      else if (angular.isArray(values)) 
        return vsprintf(s,values);
      else return formatObj(s,values);
      
    }
  }
  
  this.clone = function(obj) {
    return _.clone(obj);
  }
  
  this.extend = function(obj1,obj2) {
    return _.extend(obj1,obj2);
  }
  
  this.reject = function(item,result) {
    return _.reject(item,result);
  }
  
  this.find = function(arr,result) {
    return _.find(arr,result);
  }
  
  this.filter = function(arr,result){
    return _.filter(arr,result);
  }
  
  this.insert = function(arr,index,item) {
    arr.splice(index,0,item);
    return arr;
  }
  
  this.isArray = function(obj){
    return _.isArray(obj);
  }
  
  this.isObject = function(obj){
    return _.isObject(obj);
  }
  
  this.isString = function(obj){
    return _.isString(obj);
  }
  
  this.isNumber = function(obj){
    return _.isNumber(obj) && !_.isNaN(obj);
  }
  
  this.isDefined = function(obj) {
    return angular.isDefined(obj);
  }
  
  this.isEmpty = function(obj) {

    if (_.isString(obj)) {
      return obj.trim()==='';
    } else return !(obj);
  },
  
  this.isBoolean = function(obj) {
    return !_.isBoolean(obj);
  }
  
  this.isFunction = function(obj) {
    return _.isFunction(obj);
  }
  
  this.forEach = function(items,callback) {
    return _.forEach(items,callback);
  }
  
  this.formatSeconds = function(seconds,fmt) {
    var ret = moment.duration(seconds,'seconds').format(fmt);
    return (seconds<0)?'-'+ret:ret;
  }
  
  this.decodeBase64 = function(s) {
    return base64.decode(s);
  }
  
  this.formatSize = function (bytes) {
    if (bytes == 0) { return "0.00 B"; }
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes/Math.pow(1024, e)).toFixed(2)+' '+' KMGTP'.charAt(e)+'B';
  },
  
  this.findWhere = function (arr,obj) {
    return _.findWhere(arr,obj);
  },
  
  this.isFiles = function (obj) {
    
    if (_.isObject(obj)) {
      
      return obj instanceof FileList;
      
    } return false;
  },
  
  this.makeFormData = function (data) {
    
    var form = new FormData();
    
    if (_.isObject(data)) {
      
      var files = [];
      var names = [];
      var name = '';
      
      for (var v in data) {
        
        var r = data[v];
        
        if (this.isFiles(r)) {
          
          name = v;
          
          for (var i=0; i<r.length; i++) {

            files.push({name:v,file:r[i]});
            if (names.indexOf(v)===-1) names.push(v);
          }

        } else {

          if (angular.isObject(r)) {
            form.append(v,JSON.stringify(r));
          } else {
            form.append(v,r);
          }  
        }
      }

      if (names.length>0) form.append(name,JSON.stringify(names));
      
      for (var i in files) {
        var f = files[i];
        form.append(f.name,f.file); 
      }
      
    }
      
    return form;  
  }
  
  this.isInteger = function(obj) {
    
    return _.isNumber(obj) && (obj === +obj && obj === (obj|0));
  }
  
  this.toInteger = function(obj,def) {
    
    if (this.isInteger(obj)) return obj;
    
    var ret = _.isString(obj)?obj:(obj?obj.toString():def);
    
    var r = parseInt(ret);
    if (this.isInteger(r)) {
      ret = r;
    }
    
    return ret;
  } 
  
  this.isFloat = function(obj) {
    
    return _.isNumber(obj) && (obj === +obj && obj !== (obj|0));
  }
  
  this.toFloat = function(obj,def) {
    
    if (this.isFloat(obj)) return obj;
    
    var ret = _.isString(obj)?obj:(obj?obj.toString():def);
    
    var r = parseFloat(ret);
    if (this.isNumber(r)) {
      ret = r;
    }
    
    return ret;
  } 
  
  this.isDate = function(obj) {
    return _.isDate(obj);
  }
  
  this.toDate = function(obj,def) {
    
    if (this.isDate(obj)) return obj;
    
    return moment(obj).toDate();
  }
  
  this.cast = function(pattern,string) {
    
    var ret = _.isString(string)?string:string.toString();
    
    if (this.isInteger(pattern)) {
      var r = parseInt(ret);
      if (this.isInteger(r)) {
        ret = r;
      }
    } else if (this.isFloat(pattern)) {
      var r = parseFloat(ret);
      if (this.isFloat(r)) {
        ret = r;
      }
    }
    
    return ret;
  }
  
}]);