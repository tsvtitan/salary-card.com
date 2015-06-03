
app.factory('Page',['$http','Urls','Utils','Dictionary','Auth','Payload','Const',
                    function($http,Urls,Utils,Dictionary,Auth,Payload,Const) {
  
  function getTitle(p,def) {
    return Utils.isObject(p)?Dictionary.getProp(p.name,p.title):def;
  }
  
  function getBreadcrums(p,def) {
    
    if (Utils.isObject(p) && Utils.isArray(p.breadcrumbs)) {
      
      var crumbs = [];
      Utils.forEach(p.breadcrumbs,function(c){
        
        if (Auth.pageExists(c.name)) {
          
          var nc = Utils.clone(c);
          nc.title = Dictionary.getProp(nc.name,nc.title);
          
          crumbs.push(nc);
        }
      });
      
      return crumbs;
      
    } else return def;
  }
  
  var page = {
    
    id: null,
    title: '',
    breadcrumbs: [],
    
    set: function(page) {
      this.id = Utils.isObject(page)?page.id:null;
      this.title = getTitle(page,'');
      this.breadcrumbs = getBreadcrums(page,[]);
    },
    
    frames: function(result) {
      
      if (this.id) {
        
        $http.post(Urls.pageFrames,Payload.get({id:this.id}))
             .success(result)
             .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
     
      } else result(Const.pageNotAvailable);
    }
  }
  
  return page;
  
}]);