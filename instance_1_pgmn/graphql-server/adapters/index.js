
  const fs = require('fs');
  const path = require('path');
  const Sequelize = require('sequelize');
  sequelize = require('../connection');

  let adapters = {};
  module.exports = adapters;

  fs.readdirSync(__dirname)
    .filter( file =>{ return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  }).forEach( file =>{

    let adapter = require(path.join(__dirname, file));
    if( adapters[adapter.adapterName] ){
      throw new Error(`Duplicated adapter name ${adapter.adapterName}`);
    }
    
    switch(adapter.adapterType) {
      case 'ddm-adapter':
      case 'cenzontle-webservice-adapter':
      case 'generic-adapter':
        adapters[adapter.adapterName] = adapter; 
        break;

      case 'sql-adapter':
        adapters[adapter.adapterName] = adapter.init(sequelize, Sequelize);
        break;
      
      case 'default':
        throw new Error(`Adapter storageType '${adapter.storageType}' is not supported`);
    }
  });
  
  