// 1. Include required modules
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongoosePaginate = require('mongoose-paginate')

// 2. Define the MongoDB schema for the class collection
var classSchema = new Schema({
  course            :   {type: String, required: 'NameInvalid'},
  year              :   {type: Number, required: 'YearInvalid'},
  period            :   {type: Number, required: 'PeriodInvalid'}
});

// 3. Paginate the results
classSchema.plugin(mongoosePaginate);

// 4. Export the Class model
module.exports = mongoose.model('Class', classSchema);