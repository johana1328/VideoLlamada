const mysql = require('mysql');

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD  || '';
const MYSQL_DBNAME = process.env.MYSQL_DBNAME || 'videollamada';

const conexion= mysql.createConnection({
    dateStrings: true,
    host     : MYSQL_HOST,
    user     : MYSQL_USER,
    password : MYSQL_PASSWORD,
    database : MYSQL_DBNAME
  });

  conexion.connect(function(err) {
    if (err) throw err;
    console.log("Database Connected!");
  });

  module.exports = conexion;

