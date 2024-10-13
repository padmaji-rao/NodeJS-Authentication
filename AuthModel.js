const mongoose= require("mongoose")

//Creating a Users(table) schema and "Users" model has to be exported
const Users=mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }

})


module.exports=mongoose.model("users",Users)
