
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
  
  function getByElement(element,attr,name,values,defProperty) {
    if (element) {
      if (element.hasAttribute(attr)) {
        var attrValue = element.attributes[attr].value;
        var v = (dictionary[attrValue])?dictionary[attrValue]:dictionary[defProperty];
        if (v) {
          v = v[name];
          if (v) {
            return Utils.format(v,values);
          } else return getByElement(element.parentElement,attr,name,values,defProperty);
        } else return getByElement(element.parentElement,attr,name,values,defProperty);
      } else return getByElement(element.parentElement,attr,name,values,defProperty);
    } else {
      var v = (dictionary[name])?dictionary[name]:name;
      return Utils.format(v,values);
    }
  }
  
  return {
    init: function(d) {
      dictionary = d; 
    },
    dic: function(element,defProperty) {
      return function(name,values) {
        return getByElement(element[0],'data-ng-controller',name,values,defProperty);
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
