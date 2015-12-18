
app.factory('Page',['$http','$state',
                    'Urls','Utils','Dictionary','Auth','Payload','Const','Frame','Alert',
                    function($http,$state,
                             Urls,Utils,Dictionary,Auth,Payload,Const,Frame,Alert) {
  
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
  
  function prepareFrame(frame) {

    Frame.prepare(frame);
  }

  function prepareFrames(frames) {
    
    if (Utils.isArray(frames)) {
      
      Utils.forEach(frames,function(cols){
        
        Utils.forEach(cols,function(frame){
          
          prepareFrame(frame);
          
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
      
      $http.post(Urls.pageFrames,Payload.get({name:this.name}))
           .success(function(d){
             result(Utils.extend(d,prepareFrames(d.frames)));
           })
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    },
    
    frame: function(result) {
     
      $http.post(Urls.pageFrame,Payload.get({name:this.name}))
           .success(function(d){
             result(Utils.extend(d,prepareFrame(d.frame)));
           })
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    },
    
    reload: function(name) {
      
      if (name!==this.name) {
      
        if (Utils.isEmpty(name)) {
          name = Auth.getDefaultPageName();
        }

        if (Auth.pageExists(name)) {

          $state.transitionTo(name,{},{reload:true,inherit:false,notify:true});
          return true;

        } else Alert.error(Const.pageNotAvailable);
      }
    }
    
  }
  
  return factory;
  
}]);