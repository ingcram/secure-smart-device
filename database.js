const Sequelize = require('sequelize');
const epilogue = require('epilogue');

const database = new Sequelize({
    dialect: 'sqlite',
    storage: './smart.sqlite',
  });
  
  const Device = database.define('devices', {    
    name: Sequelize.STRING,
    ip: Sequelize.STRING,
    description: Sequelize.TEXT,
  });

const initializeDatabase = async app => {
    epilogue.initialize({ app, sequelize: database });

    epilogue.resource({
    model: Device,
    endpoints: ['/devices', '/devices/:id'],
    });

    await database.sync();
};
 

module.exports = initializeDatabase;