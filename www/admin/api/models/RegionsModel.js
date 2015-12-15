
var XLSX = require('xlsx');

module.exports = {
  
  tableName: 'regions',
  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    title: {
      type: 'string',
      required: true
    },
    areas: 'json',
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
        
        var lastRegion = null;
        var priority = 0;
        
        async.eachSeries(data,function(d,cb){
          
          if (d) {
            
            async.waterfall([

              function findRegion(cb1) {

                if (lastRegion && lastRegion.title===d.region) {

                  cb1(null,lastRegion);

                } else {

                  lastRegion = null;

                  var where = {
                    locked: [null,false],
                    lang: Utils.isObject(user)?user.lang:null,
                    title: d.region
                  };

                  self.find({where:where},{fields:{id:1,title:1,areas:1}},
                            function(err,regions){
                    cb1(err,Utils.isEmpty(regions)?null:regions[0]);          
                  });
                }
              },

              function tryCreateRegion(region,cb1) {

                if (!region) {

                  var region = {
                    title: d.region,
                    areas: [],
                    priority: priority++,
                    lang: Utils.isObject(user)?user.lang:null 
                  };

                  self.create(region,function(err,r){
                    cb1(err,r);
                  });

                } else cb1(null,region);
              },

              function addAreas(region,cb1) {

                if (region) {

                  var areas = Utils.isArray(region.areas)?region.areas:[];

                  if (d.area) {

                    var area = Utils.find(areas,function(a){
                      return a.title === d.area;
                    });

                    if (!area) {
                      
                      area = {
                        title: d.area,
                        localities: []
                      };
                      areas.push(area);
                    }
                    
                    var localities = Utils.isArray(area.localities)?area.localities:[];
                    
                    if (d.locality) {
                      
                      var locality = Utils.find(localities,function(l){
                        return l.title === d.locality;
                      });
                      
                      if (!locality) {
                        
                        localities.push({
                          title: d.locality,
                          region_ratio: parseInt(d.region_ratio),
                          north_ratio: parseInt(d.north_ratio),
                          salary_ratio: parseFloat(d.salary_ratio)
                        });
                      }
                    }
                  }

                  self.update({id:region.id},{areas:areas},function(err,u){

                    if (u) {
                      region.areas = areas;
                      lastRegion = region;
                    }
                    cb1(err);
                  });

                } else cb1('Region is not found');
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