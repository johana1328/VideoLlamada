const socket = io.connect();
const videoGrid = document.getElementById('videoGrid')
const myVideo = document.createElement('video')
myVideo.setAttribute("id", "videoLocal");
myVideo.muted = true

var peer = new Peer()

const myPeer = new Peer(undefined, {
	path: '/video-chat/peerjs',
	host: '/',
	port: '443',
})

const peers = {}
let myVideoStream
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		myVideoStream = stream
		addVideoStream(myVideo, stream)

		socket.on('user-connected', (userId) => {
			connectToNewUser(userId, stream)
			//alert('Somebody connected', userId)
		})

		peer.on('call', (call) => {
			call.answer(stream)
			const video = document.createElement('video');
			video.setAttribute("class", "videoRemote");
			call.on('stream', (userVideoStream) => {
				addVideoStream(video, userVideoStream)
			})
		})

		let text = $('input')

		$('html').keydown(function (e) {
			if (e.which == 13 && text.val().length !== 0) {
                let mensajeEnvio= {mensaje:text.val(), usuarioName: USUARIO};
				socket.emit('message', mensajeEnvio )
				text.val('')
			}
		})

		socket.on('createMessage', (mensajeEnvio, userId) => {
			$('ul').append(`<li >
								<span class="messageHeader">
									<span>
										Mensaje De
										<span class="messageSender">${mensajeEnvio.usuarioName}</span> 
									</span>

									${new Date().toLocaleString('en-US', {
										hour: 'numeric',
										minute: 'numeric',
										hour12: true,
									})}
								</span>

								<span class="message">${mensajeEnvio.mensaje}</span>
							
							</li>`)
			scrollToBottom()
		})
	})

socket.on('user-disconnected', (userId) => {
	if (peers[userId]) peers[userId].close()
})

peer.on('open', (id) => {
	socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
	eliminarRemotos();
	const call = peer.call(userId, stream)
	const video = document.createElement('video');
	video.setAttribute("class", "videoRemote");
	call.on('stream', (userVideoStream) => {
		addVideoStream(video, userVideoStream)
	})
	call.on('close', () => {
		video.remove()
	})

	peers[userId] = call
}

const addVideoStream = (video, stream) => {
	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})
	videoGrid.append(video)
}

const scrollToBottom = () => {
	var d = $('.mainChatWindow')
	d.scrollTop(d.prop('scrollHeight'))
}

// Funcionalidad para el microfono
const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false
		setUnmuteButton()
	} else {
		setMuteButton()
		myVideoStream.getAudioTracks()[0].enabled = true
	}
}

const setMuteButton = () => {
	const html = `
	  <i class="fas fa-microphone"></i>
	  <span>Mute</span>
	`
	document.querySelector('.mainMuteButton').innerHTML = html
}

const setUnmuteButton = () => {
	const html = `
	  <i class="unmute fas fa-microphone-slash"></i>
	  <span>Unmute</span>
	`
	document.querySelector('.mainMuteButton').innerHTML = html
}


// Funcionalidad para parar el video
const playStop = () => {
	let enabled = myVideoStream.getVideoTracks()[0].enabled
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false
		setPlayVideo()
	} else {
		setStopVideo()
		myVideoStream.getVideoTracks()[0].enabled = true
	}
}

const setStopVideo = () => {
	const html = `
	  <i class="fas fa-video"></i>
	  <span>Stop Video</span>
	`
	document.querySelector('.mainVideoButton').innerHTML = html
}

const setPlayVideo = () => {
	const html = `
	<i class="stop fas fa-video-slash"></i>
	  <span>Play Video</span>
	`
	document.querySelector('.mainVideoButton').innerHTML = html
}

function desconectar(){
	//socket.emit('disconnect');
	location.href='/video-chat';
}

function eliminarRemotos(){
	const elements = document.getElementsByClassName("videoRemote");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}
