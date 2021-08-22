// Importe de librerias
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
var dateFormat = require("dateformat");
const moment = require('moment'); 
const EntrevistaDao = require('./cbd/entrevistaDao');

//Definicion de constantes
const PORT = process.env.PORT || 5000;


//configuracion de peer server
const peerServer = ExpressPeerServer(server, {
	debug: true,
})

// configuracion de express
app.use('/video-chat/peerjs', peerServer);
app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use('/video-chat/static',express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res)=> {
	res.redirect('/video-chat/');
});

app.get('/video-chat/',(req, res) =>{
	res.render('index',{ msg: 'OK'})
});

app.post('/video-chat/room',(req, res) =>{
	if (Object.keys(req.body).length === 0) {
		res.redirect('/video-chat/?valid=userInvalid');
	 }else{
		let idUsuario=req.body.roomid;
		res.redirect('/video-chat/'+idUsuario);
	 }
	//res.render('index');
});

// rutas de spress
app.get('/video-chat/:room', (req, res) => {
   let idEntrevistaTem=req.params.room;
   let tipoUsuario=idEntrevistaTem.substring(idEntrevistaTem.length - 1);
   let idEntrevista=idEntrevistaTem.slice(0, -1);
	EntrevistaDao.getEntrevista(idEntrevista,function(error,resp){
          if(error){
			res.render('index',{ msg: 'CDACC01'})
		  }else{
             if(resp.length > 0){
				let entrevista=resp[0]; 
				let fechaEntrevista = moment(entrevista.fecha,"yyyy-MM-DD h:mm:ss").minutes(Number);
				let minutos=moment().diff(fechaEntrevista, 'minutes');
				//-10,120
				if(minutos>=(-10) && minutos<= 120){
					let usuarioLocal= entrevista.nombre_entrevistado;
					let usuarioRemoto=entrevista.nombre_entrevistador;
					if(tipoUsuario=='A'){
						usuarioLocal= entrevista.nombre_entrevistador;
						usuarioRemoto=entrevista.nombre_entrevistado;
					}
					res.render('room',
				 			{ roomId: idEntrevista ,
				   			userLocal: usuarioLocal,
						userRemote:usuarioRemoto})
				}else if(minutos<(-10)){
					res.render('index',{ msg: 'CDACC02'})
				}else{
					res.render('index',{ msg: 'CDACC03'})
				}
		  }else{
			res.render('index',{ msg: 'CDACC04'})
		  }
			 }	
	});
})

io.on('connection', (socket) => {
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId)
		socket.to(roomId).emit('user-connected', userId)

		socket.on('message', (message) => {
			io.to(roomId).emit('createMessage', message, userId)
		})
		socket.on('disconnect', () => {
			socket.to(roomId).emit('user-disconnected', userId)
		})
	})
})




server.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`));