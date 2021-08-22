const conexion= require('./conexion');

const EntrevistaDao = function(){};

EntrevistaDao.getEntrevista = function(token,result){
   conexion.query('select * from info_entrevista where token = ?',token,function(err, res){
    if(err) {
        console.log("error: ", err);
        result(err, null);
      }
      else{
        result(null, res);
      }
   });
}

module.exports= EntrevistaDao;