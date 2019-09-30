const path = require('path')
const fs = require('fs')

module.exports = sequelize => {
	fs
	.readdirSync(__dirname)
	.filter(file => ((file.indexOf('.')) !== 0 && (file !== "index.js")))
	.forEach(file=>{
		const model = require(path.resolve(__dirname,file))
		model.sync()
	})
}