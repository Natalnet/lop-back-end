module.exports= io =>{
	io.on('connection',socket=>{
		//console.log(socket);
		socket.on('connectRoonClass',idRoonClass=>{
			socket.join(idRoonClass)//adicionando o socket a uma sala com o id 'idRoonClass'
		})
		socket.on('connectRoonUser',idRoonUser=>{
			socket.join(idRoonUser)
		})
	})
	return (req,res,next)=>{
		req.io = io
		return next()
	}
}