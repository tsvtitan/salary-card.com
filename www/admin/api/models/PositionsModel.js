
var XLSX = require('xlsx');

module.exports = {
  
  tableName: 'positions',
  migrate: 'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  attributes: {
    
    code: 'string',
    title: {
      type: 'string',
      required: true
    },
    items: 'json',
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
        
        var lastPosition = null;
        var priority = 0;
        
        async.eachSeries(data,function(d,cb){
          
          if (d) {
            
            async.waterfall([

              function findPosition(cb1) {

                if (lastPosition && lastPosition.title===d.specialization) {

                  cb1(null,lastPosition);

                } else {

                  lastPosition = null;

                  var where = {
                    locked: [null,false],
                    lang: Utils.isObject(user)?user.lang:null,
                    title: d.specialization
                  };

                  self.find({where:where},{fields:{id:1,code:1,title:1,items:1}},
                            function(err,positions){
                    cb1(err,Utils.isEmpty(positions)?null:positions[0]);          
                  });
                }
              },

              function tryCreatePosition(position,cb1) {

                if (!position) {

                  var position = {
                    code: d.code,
                    title: d.specialization,
                    items: [],
                    priority: priority++,
                    lang: Utils.isObject(user)?user.lang:null 
                  };

                  self.create(position,function(err,s){
                    cb1(err,s);
                  });

                } else cb1(null,position);
              },

              function addItems(position,cb1) {

                if (position) {

                  var items = Utils.isObject(position.items)?position.items:[];

                  if (d.position) {

                    var item = Utils.find(items,function(i){
                      return i.title === d.position;
                    });

                    if (!item) {
                      
                      items.push({
                        title: d.position,
                        category: (d.category)?d.category:null,
                        family: (d.family)?d.family:null,
                        subfamily: (d.subfamily)?d.subfamily:null,
                        min: (d.min)?parseInt(d.min):null,
                        max: (d.max)?parseInt(d.max):null,
                        weight: (d.weight)?parseInt(d.weight):null
                      });
                      
                    } else {
                      
                      item.title = d.position;
                      item.category = (d.category)?d.category:null;
                      item.family = (d.family)?d.family:null;
                      item.subfamily = (d.subfamily)?d.subfamily:null;
                      item.min = (d.min)?parseInt(d.min):null;
                      item.max = (d.max)?parseInt(d.max):null;
                      item.weight = (d.weight)?parseInt(d.weight):null;
                    }
                  }

                  self.update({id:position.id},{items:items},function(err,u){

                    if (u) {
                      position.items = items;
                      lastPosition = position;
                    }
                    cb1(err);
                  });

                } else cb1('Position is not found');
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