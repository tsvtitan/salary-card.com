
var XLSX = require('xlsx');

module.exports = {

  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    code: {
      type: 'string',
      required: true
    },
    grades: 'json',
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
        
        Imports.fromFiles(user,self,files,['xlsx','xls'],options,function(imp,cb){
          
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
        
        var lastCorrection = null;
        var priority = 0;
        
        async.eachSeries(data,function(d,cb){
          
          if (d) {
            
            async.waterfall([

              function findCorrection(cb1) {

                if (lastCorrection && lastCorrection.code===d.code) {

                  cb1(null,lastCorrection);

                } else {

                  lastCorrection = null;

                  var where = {
                    locked: [null,false],
                    lang: Utils.isObject(user)?user.lang:null,
                    code: d.code
                  };

                  self.find({where:where},{fields:{id:1,code:1,grades:1}},
                            function(err,corrections){
                    cb1(err,Utils.isEmpty(corrections)?null:corrections[0]);          
                  });
                }
              },

              function tryCreateCorrection(correction,cb1) {

                if (!correction) {

                  var correction = {
                    code: d.code,
                    grades: {},
                    priority: priority++,
                    lang: Utils.isObject(user)?user.lang:null 
                  };

                  self.create(correction,function(err,s){
                    cb1(err,s);
                  });

                } else cb1(null,correction);
              },

              function addGrades(correction,cb1) {

                if (correction) {

                  var grades = Utils.isObject(correction.grades)?correction.grades:{};

                  if (d.grade) {

                    var grade = grades[d.grade];

                    if (!grade) {
                      
                      grades[d.grade] = {
                        75: (d['75'])?parseFloat(d['75']):null,
                        50: (d['50'])?parseFloat(d['50']):null,
                        25: (d['25'])?parseFloat(d['25']):null,
                      };
                      
                    } else {
                      
                      grade['75'] = (d['75'])?parseFloat(d['75']):null;
                      grade['50'] = (d['50'])?parseFloat(d['50']):null;
                      grade['25'] = (d['25'])?parseFloat(d['25']):null;
                    }
                  }

                  self.update({id:correction.id},{grades:grades},function(err,u){

                    if (u) {
                      correction.grades = grades;
                      lastCorrection = correction;
                    }
                    cb1(err);
                  });

                } else cb1('Correction is not found');
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