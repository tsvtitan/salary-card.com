
app.factory('Page',['$http','$q',
                    'Urls','Utils','Dictionary','Auth','Payload','Const',
                    'Tables','Graphs','Alert',
                    function($http,$q,
                             Urls,Utils,Dictionary,Auth,Payload,Const,
                             Tables,Graphs,Alert) {
  
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
          
          function execute() {
            
            var deferred = $q.defer();
            var data = {
              name: table.name,
              action: action.name,
              params: params,
              files: files
            };
            
            Tables.action(data,function(d){
              deferred.resolve(d);
            });
            
            return deferred.promise;
          }
          
          table.processing = true;
          
          execute().then(function(d){
            
            table.processing = false;
            
            if (d.error) {
              
              if (Utils.isFunction(result)) result(d);
              else Alert.error(d.error);
              
            } else if (d.reload) {
              
              table.reload(function(){
                if (Utils.isFunction(result)) result(d);
              });
              
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
        table.gridOptions = {
          columnDefs: [],
          rowData: []
        };
        
        Tables.get({name:table.name,options:options},function(d){
          
          if (Utils.isObject(d.table)) {
            
            table.gridOptions = {
              columnDefs: Utils.isArray(d.table.columns)?d.table.columns:[],
              rowData: Utils.isArray(d.table.rows)?d.table.rows:[]
            };
          }
          
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

  function processGraph(graph) {
  
    function processAction(action) {
      
      action.graph = graph;
      
      if (!Utils.isFunction(action.execute)) {
        
        action.execute = function(params,files,result) {
          
          function execute() {
            
            var deferred = $q.defer();
            var data = {
              name: graph.name,
              action: action.name,
              params: params,
              files: files
            };
            
            Graphs.action(data,function(d){
              deferred.resolve(d);
            });
            
            return deferred.promise;
          }
          
          graph.processing = true;
          
          execute().then(function(d){
            
            graph.processing = false;
            
            if (d.error) {
              
              if (Utils.isFunction(result)) result(d);
              else Alert.error(d.error);
              
            } else if (d.reload) {
              
              graph.reload(function(){
                if (Utils.isFunction(result)) result(d);
              });
              
            } else if (Utils.isFunction(result)) result(d);
            
          });
        }
      }
    }
    
    if (Utils.isArray(graph.actions)) {
    
      Utils.forEach(graph.actions,function(action){
        processAction(action);
      });
    }
    
    if (!Utils.isFunction(graph.load)) {
      
      graph.load = function(options,result) {
        
        graph.loading = true;
        graph.data = [];
        
        Graphs.get({name:graph.name,options:options},function(d){
          
          graph.data = Utils.isArray(d.data)?d.data:[];
          graph.options = options;
          graph.loading = false;
          
          if (Utils.isFunction(result)) result(d);
        });
      }
    }
    
    if (!Utils.isFunction(graph.reload)) {
      
      graph.reload = function(result) {
        
        graph.load(graph.options,function(d){
          
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
              case 'graph': processGraph(frame); break;
            }

            if (!Utils.isFunction(frame.isTable)) {
              frame.isTable = function() {
                return frame.type==='table';
              }
            }
            
            if (!Utils.isFunction(frame.isGraph)) {
              frame.isGraph = function() {
                return frame.type==='graph';
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