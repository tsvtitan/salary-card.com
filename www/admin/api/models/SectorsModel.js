
var XLSX = require('xlsx');

module.exports = {
  
  tableName: 'sectors',
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
    ratio: 'float',
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
        
        var lastSector = null;
        var priority = 0;
        
        async.eachSeries(data,function(d,cb){
          
          if (d) {
            
            async.waterfall([

              function findSector(cb1) {

                if (lastSector && lastSector.title===d.sector) {

                  cb1(null,lastSector);

                } else {

                  lastSector = null;

                  var where = {
                    locked: [null,false],
                    lang: Utils.isObject(user)?user.lang:null,
                    title: d.sector
                  };

                  self.find({where:where},{fields:{id:1,title:1,items:1,ratio:1}},
                            function(err,sectors){
                    cb1(err,Utils.isEmpty(sectors)?null:sectors[0]);          
                  });
                }
              },

              function tryCreateSector(sector,cb1) {

                if (!sector) {

                  var sector = {
                    title: d.sector,
                    items: [],
                    ratio: 1.0,
                    priority: priority++,
                    lang: Utils.isObject(user)?user.lang:null 
                  };

                  self.create(sector,function(err,s){
                    cb1(err,s);
                  });

                } else cb1(null,sector);
              },

              function addItems(sector,cb1) {

                if (sector) {

                  var items = Utils.isArray(sector.items)?sector.items:[];

                  if (d.subsector) {

                    var subsector = Utils.find(items,function(i){
                      return i.title === d.subsector;
                    });

                    if (!subsector) {
                      
                      items.push({
                        title: d.subsector,
                        ratio: (d.ratio)?parseFloat(d.ratio):1.0
                      });
                      
                    } else if (!subsector.ratio) {
                      subsector.ratio = (d.ratio)?parseFloat(d.ratio):1.0;
                    }
                  }

                  var ratio = 0.0;

                  Utils.forEach(items,function(i){
                    ratio = ratio + i.ratio;
                  });

                  if (items.length>0) 
                    ratio = parseFloat((ratio/items.length).toFixed(2));
                  else ratio = 1.0;

                  self.update({id:sector.id},{items:items,ratio:ratio},function(err,u){

                    if (u) {
                      sector.items = items;
                      sector.ratio = ratio;
                      lastSector = sector;
                    }
                    cb1(err);
                  });

                } else cb1('Sector is not found');
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