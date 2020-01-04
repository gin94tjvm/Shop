const Squelize= require('sequelize');
const sequelize = new Squelize('node-complete','root','123456',{
    host:'localhost',
    dialect:'mysql'
});

module.exports = sequelize;