
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

          table.reload(result);

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
    
    if (Utils.isObject(table.options)) {
            
      function convertTo(type,value,def) {
        
        switch (type) {
          
          case 'float': return Utils.toFloat(value,def);          
          case 'integer': return Utils.toInteger(value,def); 
          case 'string': return value;
        }
        return def;
      } 
      
      function getCellClass(col) {
        
        if (col.cellClass) return col.cellClass;
        
        switch (col.type) {
          case 'float':
          case 'integer': return "text-right";
          case 'string': return "text-left";
        }
      }
      
      var first = null;
      var possibleFirst = null;
      var columnsDic = Dictionary.getProp(table.controllerName,'columns');
      
      Utils.forEach(table.options.columnDefs,function(col){
      
        col.headerName = (columnsDic[col.headerName])?columnsDic[col.headerName]:col.headerName;
                
        col.newValueHandler = function(p) {
          p.data[col.field] = convertTo(col.type,p.newValue,p.data[col.field]);
        }
        
        if (col.format && col.type!=='string') {
          
          col.cellRenderer = function(p) {
            
            return (p.value)?Utils.format(col.format,p.value):p.value;
          }
        }
        
        if (table.children && !col.hide && !first) {
          
          if (col.first) first = col;
          if (!possibleFirst) possibleFirst = col;
        }
        
        col.cellClass = getCellClass(col);
      });
      
      Utils.forEach(table.options.columnDefs,function(col){
        
        if (col.format && col.type==='string') {
          
          col.cellRenderer = function(p) {
            
            var data = Utils.clone(p.data);
            
            for (var key in data) {
              
              var colDef = Utils.find(table.options.columnDefs,function(cl){
                return cl.field === key;
              });
              if (colDef && Utils.isFunction(colDef.cellRenderer)) {
                data[key] = colDef.cellRenderer({value:data[key]});
              }
            }
            return Utils.format(col.format,data);
          }
        }
      });
      
      first = first || possibleFirst;
      
      if (first) {
        
        first.cellRenderer = {
          renderer: 'group',
          innerRenderer: function(params) {return (params.data)?params.data[first.field]:'';}
        }
      }
      
      table.options.onReady = function(event) {

        event.api.sizeColumnsToFit();
      }
      
      table.options.onCellValueChanged = function(params) {
        
        var v = convertTo(params.colDef.type,params.newValue,params.oldValue);
        
        if (v!==params.oldValue) {
          
          params.data[params.colDef.field] = v;
          params.api.refreshRows([params.node]);
        
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
      
      table.options.localeTextFunc = function() {
        
        return function (key, defaultValue) {
          var localeText = Dictionary.getProp(table.controllerName,key);
          if (localeText) {
            return localeText;
          } else return defaultValue;
        };
      }
    }
          
    if (!Utils.isFunction(table.setData)) {
      
      table.setData = function(data) {
        
        if (table.children) {
          
          var treeData = [];
          
          (function makeTree(parent,items,level){
            
            Utils.forEach(items,function(item){
              
              var name = table.children;
              
              var children = item[name];
              if (!children) {
                
                var arr = name.split('/');
                if (arr.length>0) {
                   
                  if (level<arr.length) children = item[arr[level]];
                  else children = item[arr[arr.length-1]];
                }
              }
              
              var r = {
                group: Utils.isArray(children) && children.length>0
              };
              
              if (r.group) delete item[name];
              
              r.data = Utils.extend(item,{level:level});

              if (r.group) {

                r.children = [];

                makeTree(r.children,children,level+1);
              }

              parent.push(r);
            });
            
          })(treeData,data,0);
          
          table.options.api.setRowData(treeData);
        
        } else table.options.api.setRowData(Utils.isArray(data)?data:[]);
      }
    }
    
    if (!Utils.isFunction(table.load)) {
      
      table.load = function(options,result) {
        
        var opts = options || {};
        
        table.loading = true;
        if (table.options.api) table.options.api.showLoadingOverlay();
        table.loadCallback = undefined;
        
        factory.get({name:table.name,options:opts},function(d){
          
          table.loadOptions = opts;
          
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
          if (table.options.api) table.options.api.hideOverlay();
        });
      }
    }
    
    if (!Utils.isFunction(table.reload)) {
      
      table.reload = function(result) {
        
        table.load(table.loadOptions,result || table.loadCallback);
      }
    }
    
    if (!Utils.isFunction(table.toggle)) {
      
      table.toggle = function() {
        table.collapsed = !table.collapsed;
      }
    }
    
  }
  
  factory.prepare = function(table) {
    prepareTable(table);
  }
  
  return factory;
  
}]);