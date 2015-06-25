
app.factory('Page',['$http','$q',
                    'Urls','Utils','Dictionary','Auth','Payload','Const',
                    function($http,$q,
                             Urls,Utils,Dictionary,Auth,Payload,Const) {
  
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
               result(Utils.extend(d,processFrames(d.frames)));
             })
             .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
     
      } else result(Const.pageNotAvailable);
    }
  }
  
  return factory;
  
}]);