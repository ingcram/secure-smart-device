const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const epilogue = require('epilogue');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const database = new Sequelize({
    dialect: 'sqlite',
    storage: './smarttest.sqlite',
  });
  
  const Device = database.define('devices', {    
    name: Sequelize.STRING,
    ip: Sequelize.STRING,
    description: Sequelize.TEXT,
  });

epilogue.initialize({ app, sequelize: database });

epilogue.resource({
  model: Device,
  endpoints: ['/devices', '/devices/:id'],
});

const port =  3001;

database.sync().then(() => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});