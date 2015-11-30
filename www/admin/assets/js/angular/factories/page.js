
app.factory('Page',['$http','$q','$controller',
                    'Urls','Utils','Dictionary','Auth','Payload','Const',
                    'Tables','Charts','Forms','Alert',
                    function($http,$q,$controller,
                             Urls,Utils,Dictionary,Auth,Payload,Const,
                             Tables,Charts,Forms,Alert) {
  
  function getTitle(p,def) {
    return Utils.isObject(p)?p.title:def;
  }
  
  function getBreadcrums(p,def) {
    
    if (Utils.isObject(p) && Utils.isArray(p.breadcrumbs)) {
      
      var crumbs = [];
      Utils.forEach(p.breadcrumbs,function(c){
        
        if (Auth.pageExists(c.name)) {
          
          var nc = Utils.clone(c);
          crumbs.push(nc);
        }
      });
      
      return crumbs;
      
    } else return def;
  }

  function prepareFrames(frames) {
    
    if (Utils.isArray(frames)) {
      
      Utils.forEach(frames,function(cols){
        
        Utils.forEach(cols,function(frame){
          
          if (Utils.isObject(frame)) {
            
            if (!Utils.isFunction(frame.controller)) {
              frame.controllerName = (frame.controller)?frame.controller:frame.type;
            }
            
            switch (frame.type) {
              case 'table': Tables.prepare(frame); break;
              case 'chart': Charts.prepare(frame); break;
              case 'form': Forms.prepare(frame); break;
            }
            
            if (!Utils.isFunction(frame.isTable)) {
              frame.isTable = function() {
                return frame.type==='table';
              }
            }
            
            if (!Utils.isFunction(frame.isChart)) {
              frame.isChart = function() {
                return frame.type==='chart';
              }
            }
            
            if (!Utils.isFunction(frame.isForm)) {
              frame.isForm = function() {
                return frame.type==='form';
              }
            }

            if (!Utils.isFunction(frame.controller)) {
 
              frame.controller = function($scope,$element){
                return $controller(frame.controllerName,{'$scope':$scope,'$element':$element});
              }
            }
            
          }  

        });
      });
      
      return {frames:frames};
      
    } else return {frames:[]};
  }
  
  var factory = {
    
    name: '',
    title: '',
    breadcrumbs: [],
    
    set: function(page) {
      this.name = Utils.isObject(page)?page.name:'';
      this.title = getTitle(page,'');
      this.breadcrumbs = getBreadcrums(page,[]);
    },
    
    frames: function(result) {
      
      if (this.name) {
        
        $http.post(Urls.pageFrames,Payload.get({name:this.name}))
             .success(function(d){
               result(Utils.extend(d,prepareFrames(d.frames)));
             })
             .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
     
      } else result(Const.pageNotAvailable);
    }
  }
  
  return factory;
  
}]);