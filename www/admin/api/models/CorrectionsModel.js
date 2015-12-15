
var XLSX = require('xlsx');

module.exports = {

  tableName: 'corrections',
  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    code: {
      type: 'string',
      required: true
    },
    '7_25': 'float',
    '7_50': 'float',
    '7_75': 'float',
    '8_25': 'float',
    '8_50': 'float',
    '8_75': 'float',
    '9_25': 'float',
    '9_50': 'float',
    '9_75': 'float',
    '10_25': 'float',
    '10_50': 'float',
    '10_75': 'float',
    '11_25': 'float',
    '11_50': 'float',
    '11_75': 'float',
    '12_25': 'float',
    '12_50': 'float',
    '12_75': 'float',
    '13_25': 'float',
    '13_50': 'float',
    '13_75': 'float',
    '14_25': 'float',
    '14_50': 'float',
    '14_75': 'float',
    '15_25': 'float',
    '15_50': 'float',
    '15_75': 'float',
    '16_25': 'float',
    '16_50': 'float',
    '16_75': 'float',
    '17_25': 'float',
    '17_50': 'float',
    '17_75': 'float',
    '18_25': 'float',
    '18_50': 'float',
    '18_75': 'float',
    '19_25': 'float',
    '19_50': 'float',
    '19_75': 'float',
    '20_25': 'float',
    '20_50': 'float',
    '20_75': 'float',
    '21_25': 'float',
    '21_50': 'float',
    '21_75': 'float',
    '22_25': 'float',
    '22_50': 'float',
    '22_75': 'float',
    '23_25': 'float',
    '23_50': 'float',
    '23_75': 'float',
    priority: 'integer',
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  },
  
  changeKeys: ['id'],
  
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

                  var obj = {};
                  
                  obj[Utils.format('{grade}_75',d)] = (d['75'])?parseFloat(d['75']):null;
                  obj[Utils.format('{grade}_50',d)] = (d['50'])?parseFloat(d['50']):null;
                  obj[Utils.format('{grade}_25',d)] = (d['25'])?parseFloat(d['25']):null;
                  
                  self.update({id:correction.id},obj,function(err,u){

                    if (u) {
                      correction = Utils.extend(correction,obj);
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