
var XLSX = require('xlsx');

module.exports = {

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
    locked: 'datetime',
    lang: 'string',
    
    toJSON: function() {
      
      return Utils.extend({},this);
    }
  },
  
  import: function(user,params,files,result) {
    
    var log = this.log;
    var self = this;
    var extensions = ['xlsx','xls'];
    
    async.waterfall([
     
      function filterFiles(ret) {
        
        var list = Utils.filter(files,function(f){
          
          var ext = Utils.fileExtension(f.filename).toLowerCase();
          return extensions.indexOf(ext)!==-1;
        });
        
        ret(null,list);
      },
      
      function createImports(list,ret) {
        
        if (!Utils.isEmpty(list)) {
          
          async.map(list,function(l,cb){
            
            var imp = {
              name: self.tableName,
              creator: Utils.isObject(user)?user.login:null,
              created: moment().toDate(),
              path: l.fd,
              size: l.size,
              fileName: l.filename,
              priortiy: list.indexOf(l),
              lang: Utils.isObject(user)?user.lang:null
            };
            
            Imports.create(imp,function(err,i){
              
              if (i) {
                l.need = true;
              }
              cb(err,i);
            });
            
          },function(err,imports){
            ret(err,imports);
          });
          
        } else ret('Files are not found');
      },
      
      function readImports(imports,ret) {
        
        if (!Utils.isEmpty(imports)) {
          
          async.each(imports,function(i,cb){
            
            var workbook = XLSX.readFileSync(i.path);
            if (Utils.isObject(workbook)) {
              
              var sheet = workbook.Sheets[self.tableName];
              if (Utils.isObject(sheet))
                i.data = XLSX.utils.sheet_to_json(sheet);
            }
            cb(null);
            
          },function(err){
            ret(err,imports);
          });
          
        } else ret('Imports are not found');
        
      },
      
      function updateImports(imports,ret) {
        
        async.map(imports,function(i,cb){
          
          Imports.update({id:i.id},{data:i.data},function(err){
            cb(err,i.data);
          });
          
        },function(err,results){
          
          var data = [];
          Utils.forEach(results,function(r){
            data = data.concat(r);
          });
          ret(err,data);
        });
      },
      
      function makeHistory(data,ret) {
        
        if (!Utils.isEmpty(data)) {
          
          self.update({locked:[null,false]},{locked:moment().toDate()},
                      function(err){
            ret(err,data);            
          });
          
        } else ret('Data are not found');
      },
      
      function importSectors(data,ret) {
        
        var lastSector = null;
        
        async.eachSeries(data,function(d,cb){
          
          async.waterfall([
            
            function findSector(cb1) {
              
              if (lastSector && lastSector.title===d.sector) {
                
                cb1(null,lastSector);
                
              } else {
                
                lastSector = null;
                
                var where = {
                  locked: [null,false],
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
                  ratio: 1.0
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
          
        },function(err){
          ret(err);
        });
      }
      
    ],function(err){
      result(err,{reload:true});
    });
   
  }
  
}