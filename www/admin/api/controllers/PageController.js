
module.exports = {
  
  index: function(req,res) {

    res.jsonSuccess();
  },
  
  frames: function(req,res) {
    
    var log = this.log;
    
    function error(s) {
      log.error(s,null,1);
      res.jsonError('Frames error');
    }
    
    if (req.session && req.session.userId) {

      async.waterfall([

        function getPage(ret){

          var where = {name: (req.body)?req.body.name:null};
          var fields = {name:1,type:1,class:1,template:1,frames:1,form:1,
                       collapsed:1,canClose:1,canCollapse:1,locked:1};

          Users.getModelRecord(req.session.userId,Pages,fields,where,null,null,
                               function(err,page){
            ret(err,page);
          });
        },

        function getItems(page,ret){

          if (page && Utils.isArray(page.frames)) {

            var items = [];

            Utils.forEach(page.frames,function(cols){

              Utils.forEach(cols,function(frame){

                var item = Utils.find(items,function(item){
                  return item.name === frame.name;
                });

                if (!item && frame.type && !frame.locked) {
                  
                  var model = null;
                  var fields = {name:1,title:1,description:1,template:1,actions:1,
                              controller:1,collapsed:1,canClose:1,canCollapse:1,titleVisible:1};

                  switch (frame.type) {

                    case 'table': {
                      model = Tables;
                      fields = Utils.extend(fields,{model:1,icon:1,options:1,class:1,children:1});
                      fields = Utils.extend(fields,{columnDefs:1,headerName:1,field:1,hide:1,rowSelection:1,enableSorting:1,pinnedColumnCount:1,
                                                    rowHeight:1,enableColResize:1,showToolPanel:1,singleClickEdit:1,suppressScrollLag:1,width:1,
                                                    editable:1,id:1,cellClass:1,first:1,groupHeaders:1,headerGroup:1,format:1,type:1});
                      break;
                    }
                    case 'chart': {
                      model = Charts;
                      fields = Utils.extend(fields,{icon:1,options:1,class:1});
                      fields = Utils.extend(fields,{chart:1,type:1,margin:1,top:1,right:1,bottom:1,left:1,
                                                    showValues:1,valueFormat:1,transitionDuration:1,xAxis:1,axisLabel:1,yAxis:1,
                                                    axisLabelDistance:1,x:1,y:1,height:1,useInteractiveGuideline:1,clipVoronoi:1,
                                                    showMaxMin:1,staggerLabels:1,tickFormat:1,rotateLabels:1,orient:1,tickSize:1,
                                                    tickPadding:1,tickSubdivide:1,lines:1,styles:1,css:1,clipEdge:1,xType:1,yType:1,
                                                    stacked:1,zoom:1,enabled:1,scaleExtent:1,useFixedDomain:1,useNiceScale:1,
                                                    horizontalOff:1,verticalOff:1,unzoomEventType:1,showControls:1,duration:1,
                                                    legend:1,labelThreshold:1,labelSunbeamLayout:1,labelsOutside:1,
                                                    rotateYLabel:1,rotateXLabel:1,x2Axis:1,y2Axis:1,color:1,donut:1
                                                    });
                      break;
                    }
                    case 'form': {
                      model = Forms;
                      fields = Utils.extend(fields,{icon:1,options:1,class:1,canReload:1});
                      fields = Utils.extend(fields,{fields:1,submit:1,cancel:1,page:1});
                    }
                  }

                  if (model) {

                    items.push({
                      name: frame.name,
                      model: model,
                      where: { name: frame.name },
                      fields: fields,
                      type: frame.type
                    });
                  }  
                }

              });
            });

            ret(null,page.frames,items);

          } else ret(null,null,null);
        },

        function collect(frames,items,ret){

          if (items && items.length>0) {

            async.map(items,function(i,cb){

              Users.getModelRecord(req.session.userId,i.model,i.fields,i.where,null,{},
                                   function(err,r,user){

                if (!err && r) {
                  
                  switch (i.type) {

                    case 'table': {
                      
                      var model = Utils.find(sails.models,function(m){
                        return m.globalId === r.model;
                      });
                      
                      if (model && r.options && r.options.columnDefs) {
                        
                        if (r.children) {
                          r.options.rowsAlreadyGrouped = true;
                        }
                        
                        Utils.forEach(r.options.columnDefs,function(col){
                          
                          var attr = model.attributes[col.field];
                          
                          if (Utils.isString(attr)) {
                            col.type = attr;
                          } else if (Utils.isObject(attr) && Utils.isString(attr.type)) {
                            col.type = attr.type;
                          }

                        });
                      }
                      break;
                    }
                  }
                  
                  if (Utils.isArray(r.actions) && r.actions.length>0) {
                    
                    async.map(r.actions,function(a,cb1){

                      Permissions.asOr(user,i.name,a.name,false,function(err,access){

                        if (a && !access) {
                          a = null;
                        }
                        cb1(err,a);
                      });

                    },function(err1,arr1){
                      r.actions = Utils.filter(arr1,function(a){
                        return (a);
                      });
                      cb(err1,{name:i.name,record:r,fields:i.fields});
                    });
                    
                  } else cb(err,{name:i.name,record:r,fields:i.fields});

                } else cb(err,{name:i.name,record:r,fields:i.fields});
              });


            },function(err,arr){

              if (err) ret(err);
              else if (arr) {

                var table = [];
                
                Utils.forEach(frames,function(cols){
                  
                  var records = [];

                  Utils.forEach(cols,function(frame){
                    
                    if (!frame.locked) {
                    
                      var obj = Utils.find(arr,function(a){
                        return a.name === frame.name;
                      });

                      if (obj && obj.record) {

                        var rec = Utils.clone(obj.record);
                        rec = Utils.extend(rec,frame);
                        records.push(rec);
                      }
                    }
                  });

                  if (records.length>0) {
                    table.push(records);
                  }
                });

                ret(null,table);
              }  
            });

          } else ret(null,null);

        }

      ],function(err,frames){
        if (err) error(err);
        else {
          res.jsonSuccess({frames:Utils.isArray(frames)?frames:[]});
        }
      });

    } else res.userNotFound();
  }
  
}

