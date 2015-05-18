
var includeAll = require('include-all'),
    path = require('path'),
    Agenda = require('agenda');


function Jobs(name) {

  this.name = name;
  this.files = {};

  var agenda = new Agenda(sails.config.jobs);
  this.agenda = agenda;

  agenda.name('bootstrap');

  var self = this;

  agenda.on('start',function(job) {
    job.name = job.attrs.name;
    job.stop = function(){
      job.forced = true;
      self.log.debug('{name} is stopping...',job);
      self.stop(job.attrs.name);
    }
    self.log.debug('{name} is starting...',job);
  });

  agenda.on('success',function(job) {
    self.log.debug('{name} finished {reason}',{name:job.name,reason:(job.forced)?'forcedly':'successfully'});
  });

  agenda.on('fail',function(err,job) {
    self.log.error('{name} finished with error: {error}',{name:job.name,error:err});
  });

  agenda.start();
}

Jobs.prototype = {

  setFile: function(name,file) {
    this.files[name] = file;
  },

  define: function(name,result) {
    var f = this.files[name];
    if (f && f.event) {

      var self = this;
      var n = Utils.format('%s/%s',[self.name.toLowerCase(),name]);

      Events.on(n,function(data){

        var job = n.slice(self.name.length+1);
        self.start(job,null,data);
      });
    }
    this.agenda.define(name,result);
  },

  start: function(name,interval,data,result) {

    var ret = false;
    var log = this.log;

    try {

      var dataIsFunc = Utils.isFunction(data);
      var needDefine = (result || dataIsFunc);

      if (needDefine) {      

        this.stop(name);

        this.agenda.define(name,function(job,done){
          if (dataIsFunc) {
            data(job,done);
          } else result(job,done);
        });
      }

      var flag = true;
      var file = this.files[name];
      if (!interval && file) {
        interval = file.interval;
        flag = (!interval);
      }
      if (interval) {
        this.agenda.every(interval,name,(!dataIsFunc)?data:null);
        if (flag && file) {
          file.interval = interval;
        }
      }

      ret = true;

    } catch(e) {
      log.exception(e);
    } finally {
      return ret;
    }
  },

  stop: function(name) {
    var log = this.log;
    this.agenda.cancel({name:name},function(err){
      if (err) log.error(err);
    }); 
  }
}

function loadJobs(dir) {

  dir = path.resolve(sails.config.appPath,dir);
  return includeAll({
    dirname: dir,
    filter: /(.+)\.js$/,
    excludeDirs : /^\.(git|svn)$/,
    optional: true,
    keepDirectoryPath: true,
    flattenDirectories: true
  }) || {};
}

function setOptions(file) {

  if (sails.config.jobs) {

    var opts = Utils.path2obj(sails.config.jobs,file.name,'/');
    file.disabled = (opts && Utils.isDefined(opts.disabled))?opts.disabled:file.disabled;
    file.interval = (opts && Utils.isDefined(opts.interval))?opts.interval:file.interval;
    file.options = (opts && Utils.isDefined(opts.options))?opts.options:file.options;
  }

  if (Config.jobs) {

    var opts = Utils.path2obj(Config.jobs,file.name,'/');
    file.disabled = (Utils.isDefined(opts))?!opts:file.disabled;
  }
}

function registerJobs(jobs,dir,prefix) {

  var log = jobs.log;
  var files = loadJobs(dir);
  if (files) {

    for (var i in files) {

      var file = files[i];

      if (file) {

        file.name = (file.name)?file.name:i.toString();
        file.name = (prefix)?prefix+file.name:file.name;

        setOptions(file);

        if (!file.disabled && file.execute) {

          jobs.setFile(file.name,file);

          log.debug('{name} is loading...',file);

          file = Log.extend(file,jobs.name.toLowerCase(),file.name,null,true);

          jobs.define(file.name,function(job,done){

            var f = jobs.files[job.name];
            if (f) {
              f.execute(job,done);
            } else done();
          });

          if (file.interval) {
            if (file.autoStart) jobs.start(file.name,file.interval,file.data);
          }
        }
      }
    }
  }
}

module.exports = function() {

  var jobs = new Jobs('Jobs');
  jobs = Log.extend(jobs,null,jobs.name);
  
  var need = Config.jobs || (!Config.jobs && !sails.config.jobs.disabled);
  if (need) registerJobs(jobs,sails.config.jobs.directory);
  
  return events;
}