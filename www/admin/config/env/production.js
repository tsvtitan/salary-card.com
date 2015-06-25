/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/
  
  port: process.env.PORT || 1337,
  environment: process.env.NODE_ENV || 'production',
  
  connections: {
    
    workConnection: {
      adapter: 'sails-mongo',
      host: 'localhost',
      database: 'admin'
    }
  },
  
  models: {
    connection: 'workConnection',
    migrate: 'alter'
  },
  
  session: {
    adapter: 'redis',
    host: 'localhost'
  },
  
  sockets: {
    adapter: 'socket.io-redis',
    host: 'localhost'
  },
  
  cors: {
    allRoutes: true
  },
  
  jobs: {
    
    disabled: true,
    
    db: {
      address: 'localhost:27017/admin',
      collection: 'jobs'
    }
  },
  
  events: {
    
    disable: false,
    
    host: 'localhost',
    scope: 'admin'
  }
  
};
