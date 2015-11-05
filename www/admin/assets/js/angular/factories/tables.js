
app.factory('Tables',['$http','$q','Urls','Utils','Dictionary','Payload','Const','Alert',
                      function($http,$q,Urls,Utils,Dictionary,Payload,Const,Alert) {
  
  
  var factory = {
    
    action: function(d,result) {
      
      $http.post(Urls.tablesAction,Utils.makeFormData(Payload.get(d)),{
                  headers: {'Content-Type':undefined},
                            transformRequest:angular.identity
                })
           .success(result)
           .error(function(d) { result({error:Dictionary.connectionFailed(d)}); });
    },

    get: function(d,result) {
      
      $http.post(Urls.tablesGet,Payload.get(d))
           .success(result)
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    }
  }
  
  function prepareTable(table) {
  
    function executeAction(name,params,files,result) {
      
      function execute() {

        var deferred = $q.defer();
        var data = {
          name: table.name,
          action: name,
          params: params,
          files: files
        };

        factory.action(data,function(d){
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
    
    function prepareAction(action) {
      
      action.table = table;
      
      if (!Utils.isFunction(action.execute)) {
        
        action.execute = function(params,files,result) {
          executeAction(action.name,params,files,result);
        };
      }
    }
    
    if (Utils.isArray(table.actions)) {
    
      Utils.forEach(table.actions,function(action){
        prepareAction(action);
      });
    }
    
    if (Utils.isObject(table.grid)) {
            
      function convertTo(type,value,def) {
        
        var ret = def;
        
        switch (type) {
          
          case 'float': {
            ret = Utils.toFloat(value,def);
            break;
          }
          
          case 'integer': {
            ret = Utils.toInteger(value,def); 
            break;
          }
          
          case 'string': {
            ret = value;
            break;
          }
        }
        return ret;
      } 
      
      var first = true;
      
      Utils.forEach(table.grid.columnDefs,function(col){
      
        col.newValueHandler = function(p) {
          p.data[col.field] = convertTo(col.type,p.newValue,p.data[col.field]);
        }
        
        if (table.children && !col.hide && col.first && first) {
          
          first = false;
          
          col.cellRenderer = {
            renderer: 'group',
            innerRenderer: function(params) {return (params.data)?params.data[col.field]:'';}
          }
        }
        
      });
      
      table.grid.onReady = function(event) {

        event.api.sizeColumnsToFit();
      }
      
      table.grid.onCellValueChanged = function(params) {
        
        if (params.newValue!==params.oldValue) {
          
          params.data[params.colDef.field] = params.newValue;
        
          executeAction('change',params.data,null,function(d){

            if (d.error) {

              params.data[params.colDef.field] = params.oldValue;
              params.newValue = params.oldValue;
              params.api.refreshRows([params.node]);
              
              Alert.error(d.error);
            }
          });
        }
      }
    }
          
    if (!Utils.isFunction(table.setData)) {
      
      table.setData = function(data) {
        
        if (table.children) {
          
          var treeData = [];
          
          (function makeTree(parent,items,level){
            
            Utils.forEach(items,function(item){
              
              var children = item[table.children];
              
              var r = {
                group: Utils.isArray(children) && children.length>0
              };
              
              if (r.group) delete item[table.children];
              
              r.data = Utils.extend(item,{level:level});

              if (r.group) {

                r.children = [];

                makeTree(r.children,children,level+1);
              }

              parent.push(r);
            });
            
          })(treeData,data,0);
          
          table.grid.api.setRowData(treeData);
        
        } else table.grid.api.setRowData(Utils.isArray(data)?data:[]);
      }
    }
    
    if (!Utils.isFunction(table.load)) {
      
      table.load = function(options,result) {
        
        table.loading = true;
        table.loadCallback = undefined;
        
        factory.get({name:table.name,options:options},function(d){
          
          table.options = options;
          
          if (Utils.isFunction(result)) {
            
            table.loadCallback = result;
            result(d);
            
          } else {
            
            if (d.error) Alert.error(d.error);
            else {
              table.setData(d.data);
            }
          } 
          
          table.loading = false;
        });
      }
    }
    
    if (!Utils.isFunction(table.reload)) {
      
      table.reload = function(result) {
        
        table.load(table.options,result || table.loadCallback);
      }
    }
    
  }
  
  factory.prepare = function(table) {
      
    prepareTable(table);
  }

  
  return factory;
  
}]);