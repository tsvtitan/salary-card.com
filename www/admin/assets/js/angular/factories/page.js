
app.factory('Page',['Utils','Dictionary','Auth',
                    function(Utils,Dictionary,Auth) {
  
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
      
    } return def;
  }
  
  var page = {
    
    page: false,
    title: '',
    breadcrumbs: [],
    
    set: function(page) {
      this.page = page;
      this.title = getTitle(page,'');
      this.breadcrumbs = getBreadcrums(page,[]);
    }
  }
  
  return page;
  
}]);