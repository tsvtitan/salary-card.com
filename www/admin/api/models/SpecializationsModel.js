
var XLSX = require('xlsx');

module.exports = {
  
  tableName: 'specializations',
  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    title: {
      type: 'string',
      required: true
    },
    items: 'json',
    code: 'string',
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
        
        var lastSpec = null;
        var priority = 0;
        
        async.eachSeries(data,function(d,cb){
          
          if (d) {
            
            async.waterfall([

              function findSpec(cb1) {

                if (lastSpec && lastSpec.title===d.area) {

                  cb1(null,lastSpec);

                } else {

                  lastSpec = null;

                  var where = {
                    locked: [null,false],
                    lang: Utils.isObject(user)?user.lang:null,
                    title: d.area
                  };

                  self.find({where:where},{fields:{id:1,title:1,items:1}},
                            function(err,specializations){
                    cb1(err,Utils.isEmpty(specializations)?null:specializations[0]);          
                  });
                }
              },

              function tryCreateSpec(specialization,cb1) {

                if (!specialization) {

                  var specialization = {
                    title: d.area,
                    items: [],
                    priority: priority++,
                    lang: Utils.isObject(user)?user.lang:null 
                  };

                  self.create(specialization,function(err,s){
                    cb1(err,s);
                  });

                } else cb1(null,specialization);
              },

              function addItems(specialization,cb1) {

                if (specialization) {

                  var items = Utils.isArray(specialization.items)?specialization.items:[];

                  if (d.specialization) {

                    var item = Utils.find(items,function(i){
                      return i.title === d.specialization;
                    });

                    if (!item) {
                      items.push({
                        title: d.specialization,
                        code: d.code
                      });
                    } else if (!item.code) {
                      item.code = d.code;
                    }
                  }

                  self.update({id:specialization.id},{items:items},function(err,u){

                    if (u) {
                      specialization.items = items;
                      lastSpec = specialization;
                    }
                    cb1(err);
                  });

                } else cb1('Specialization is not found');
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