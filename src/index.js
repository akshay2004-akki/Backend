import dotenv from 'dotenv'
import connectDB from './db/index.js'
import app from './app.js'
dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.on("error", (err)=>{
        console.log("error occured database connection failed", err)
    })
    app.listen(process.env.PORT, ()=>{
        console.log("connection to database successfull on port : ", process.env.PORT)
    })
})
.catch((err)=>{
    console.log("connection to database failed ", err)
})