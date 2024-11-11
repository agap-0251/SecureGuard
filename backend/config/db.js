const mongoose = require('mongoose')

const connectDB = async()=>{
    try{
    mongoose.connect(process.env.MONGO_URI,{
        dbName : 'SecureGuard'
    })
        console.log('MongoDB Connected')
    
}catch(err){
        console.log(err)
        process.exit(1)
    }
}

module.exports = connectDB
