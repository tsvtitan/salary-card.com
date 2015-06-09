
app.factory('Page',['$http','Urls','Utils','Dictionary','Auth','Payload','Const','Tables',
                    function($http,Urls,Utils,Dictionary,Auth,Payload,Const,Tables) {
  
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
  
  function processTable(table) {
  
    function processAction(action) {
      
      action.table = table;
      
      if (!Utils.isFunction(action.execute)) {
        
        action.execute = function(params,files,result) {
          
          Tables.action({name:table.name,action:action.name,params:params,files:files},function(d){
            
            if (d.reload) {
              
              //table.reload(function(d){
                if (Utils.isFunction(result)) result(d);
              //});
              
            } else if (Utils.isFunction(result)) result(d);
          });
        }
      }
    }
    
    if (Utils.isArray(table.actions)) {
    
      Utils.forEach(table.actions,function(action){
        processAction(action);
      });
    }
    
    if (!Utils.isFunction(table.load)) {
      
      table.load = function(options,result) {
        
        table.loading = true;
        table.data = [];
        
        Tables.get({name:table.name,options:options},function(d){
          
          table.data = Utils.isArray(d.data)?d.data:[];
          table.options = options;
          table.loading = false;
          
          if (Utils.isFunction(result)) result(d);
        });
      }
    }
    
    if (!Utils.isFunction(table.reload)) {
      
      table.reload = function(result) {
        
        table.load(table.options,function(d){
          
          if (Utils.isFunction(result)) result(d);
        });
      }
    }
  }
  
  function processFrames(frames) {
    
    if (Utils.isArray(frames)) {
      
      Utils.forEach(frames,function(cols){
        
        Utils.forEach(cols,function(frame){
          
          if (Utils.isObject(frame)) {
            
            switch (frame.type) {
              case 'table': processTable(frame); break;
            }

            if (!Utils.isFunction(frame.isTable)) {
              frame.isTable = function() {
                return frame.type==='table';
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
               result(Utils.extend(d,processFrames(d.frames)));
             })
             .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
     
      } else result(Const.pageNotAvailable);
    }
  }
  
  return factory;
  
}]);