
jest.setTimeout(30000);


require('../models/User');

const mongoose = require('mongoose')
const keys = require('../config/keys')

mongoose.Promise = global.Promise //mogoose doesnot use its built in promise it wants to tell what promise we need to use
                 // assigning nodejs global Promise object 
mongoose.connect(keys.mongoURI, { useNewUrlParser: true });
