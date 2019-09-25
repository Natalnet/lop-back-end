module.exports= io =>{
	io.on('connection',socket=>{
		socket.on('connectRoonRequestClass',idRoon=>{
			socket.join(idRoon)//adicionando o socket a uma sala com o id 'idRonn'
		})
		socket.on('connectRoonMyRequestsClass',idRoon=>{
			socket.join(idRoon)
		})
	})
	return (req,res,next)=>{
		req.io = io
		return next()
	}
}