
app.factory('Dictionary',['Utils','Const',
                          function(Utils,Const){
  
  var dictionary = {};
  
  function getByProp(prop,name,values) {
    var v = dictionary[prop];
    if (v) {
      v = v[name];
      if (v) {
        return Utils.format(v,values);
      }
    }
    v = (dictionary[name])?dictionary[name]:name;
    return Utils.format(v,values);
  }
  
  function getByElement(element,attr,name,values) {
    if (element) {
      if (element.hasAttribute(attr)) {
        var v = dictionary[element.attributes[attr].value];
        if (v) {
          v = v[name];
          if (v) {
            return Utils.format(v,values);
          } else return getByElement(element.parentElement,attr,name,values);
        } else return getByElement(element.parentElement,attr,name,values);
      } else return getByElement(element.parentElement,attr,name,values);
    } else {
      var v = (dictionary[name])?dictionary[name]:name;
      return Utils.format(v,values);
    }
  }
  
  return {
    init: function(d) {
      dictionary = d; 
    },
    dic: function(element) {
      return function(name,values) {
        return getByElement(element[0],'data-ng-controller',name,values);
      }
    },
    get: function(s,values) {
      return getByProp(null,s,values);
    },
    getProp: function(prop,s,values) {
      return getByProp(prop,s,values);
    },
    format: function(s,values) {
      return Utils.format(s,values);
    },
    connectionFailed: function(d) {
      return (d)?d:this.get(Const.connectionFailed);
    },
    couldNotSubscribeOnEvent: function() {
      return this.get(Const.couldNotSubscribeOnEvent);
    },
    couldNotUnsubscribeFromEvent: function() {
      return this.get(Const.couldNotUnsubscribeFromEvent);
    }
  }
}]);
