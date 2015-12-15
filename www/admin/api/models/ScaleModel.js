
var XLSX = require('xlsx');

module.exports = {
  
  tableName: 'scale',
  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    title: {
      type: 'string',
      required: true
    },
    assortment: 'json',
    priority: 'integer',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  },
  
  import: function(user,params,files,result) {
    
    var self = this;
    
    async.waterfall([
     
      function getData(ret) {
        
        var options = {
          history: true
        };
        
        ImportsModel.fromFiles(user,self,files,['xlsx','xls'],options,function(imp,cb){
          
          try {
            
            var data = null;
            
            var workbook = XLSX.readFileSync(imp.source);
            if (Utils.isObject(workbook)) {
              
              var sheet = workbook.Sheets[self.tableName];
              if (Utils.isObject(sheet))
                data = XLSX.utils.sheet_to_json(sheet);
            }
            
            cb(null,data);
            
          } catch(e) {
            cb(e.message);
          }  
          
        },function(err,data){
          ret(err,data);
        });
      },
      
      function importData(data,ret) {
        
        var lastScale = null;
        var priority = 0;
        
        async.eachSeries(data,function(d,cb){
          
          if (d) {
            
            async.waterfall([

              function findScale(cb1) {

                if (lastScale && lastScale.title===d.scale) {

                  cb1(null,lastScale);

                } else {

                  lastScale = null;

                  var where = {
                    locked: [null,false],
                    lang: Utils.isObject(user)?user.lang:null,
                    title: d.scale
                  };

                  self.find({where:where},{fields:{id:1,title:1,assortment:1}},
                            function(err,scales){
                    cb1(err,Utils.isEmpty(scales)?null:scales[0]);          
                  });
                }
              },

              function tryCreateScale(scale,cb1) {

                if (!scale) {

                  var scale = {
                    title: d.scale,
                    assortment: [],
                    priority: priority++,
                    lang: Utils.isObject(user)?user.lang:null 
                  };

                  self.create(scale,function(err,s){
                    cb1(err,s);
                  });

                } else cb1(null,scale);
              },

              function addAssortment(scale,cb1) {

                if (scale) {

                  var assortment = Utils.isArray(scale.assortment)?scale.assortment:[];

                  if (d.assortment) {

                    var item = Utils.find(assortment,function(i){
                      return i.title === d.assortment;
                    });

                    if (!item) {
                      assortment.push({
                        title: d.assortment,
                        grade: parseInt(d.grade)
                      });
                    } else if (!item.grade) {
                      item.grade = parseInt(d.grade);
                    }
                  }

                  var ratio = 0.0;

                  self.update({id:scale.id},{assortment:assortment},function(err,u){

                    if (u) {
                      scale.assortment = assortment;
                      lastScale = scale;
                    }
                    cb1(err);
                  });

                } else cb1('Scale is not found');
              }

            ],function(err1){
              cb(err1);
            });
            
          } else cb(null);  
          
        },function(err){
          ret(err);
        });
        
       
      }
      
    ],function(err){
      result(err,{reload:true});
    });
   
  }
  
}