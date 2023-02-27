const mongoose = require('mongoose');

function connectDB() {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('database connected')
    }).catch((err) => {
        console.log(err)
    });
}

module.exports = connectDB;