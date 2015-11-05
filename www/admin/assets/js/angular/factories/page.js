
app.factory('Page',['$http','$q','$controller',
                    'Urls','Utils','Dictionary','Auth','Payload','Const',
                    'Tables','Graphs','Alert',
                    function($http,$q,$controller,
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

  function prepareGraph(graph) {
  
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
                      
  function prepareFrames(frames) {
    
    if (Utils.isArray(frames)) {
      
      Utils.forEach(frames,function(cols){
        
        Utils.forEach(cols,function(frame){
          
          if (Utils.isObject(frame)) {
            
            switch (frame.type) {
              case 'table': Tables.prepare(frame); break;
              case 'graph': prepareGraph(frame); break;
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

            if (!Utils.isFunction(frame.controller)) {
              
              var controller = (frame.controller)?frame.controller:frame.type
              frame.controller = function($scope){
                
                //$scope.table = (frame.isTable())?frame:null;
                return $controller(controller,{'$scope':$scope/*,'table':$scope.table*/});
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