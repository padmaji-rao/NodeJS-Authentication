const express=require("express")
const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const Users=require("./authModel")


//Middleware Function
const authenticateToken=(req,res,next)=>{
    const authHeader=req.headers["authorization"]
    
    if (authHeader !==undefined){
        jwtToken=authHeader.split(" ")[1]
        if (jwtToken===undefined){
            res.status(401)
            res.send("Invalid JWT Token")
        }else {
            jwt.verify(jwtToken,"SECRET",async(err, payload) =>{
                if (err){
                    res.status(401)
                    res.send("Invalid JWT Token")
                }else {
                    req.username=payload.username
                    next()                              //---->important
                }
            })
        }
    }else {
        res.status(400)
        res.send("Authentication Header is not accessed properly")
    }

}

const app=express()

app.use(express.json())    //---->accept and parse json request body

const dbURI="mongodb+srv://naturalmovies267:Natural%40123@cluster0.dol4q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"    //taken from mongodb website (Connection String for NodeJS Driver)
mongoose.connect(dbURI).then(()=>{console.log(`DB connected ...`)}).catch(err=>console.log(`DB NOT Connected :${err}`))


app.post("/users",async(req,res)=>{
    const {username,password,email,name,location}=req.body
    const hashedPassword=await bcrypt.hash(password,10)

    const dbUser=await Users.findOne({username})
    
    if (!dbUser){
        try{
            const newUser=Users({username,password:hashedPassword,email,name,location})
            await newUser.save()
            res.send(`User Created Successfully...`)
        }catch(err){
            console.log(err.message)
        }
    }else {
        res.status(400)
        res.send(`User already exists`)
    }
        
})


app.post("/login",async(req,res)=>{
    const {username,password}=req.body 
    const dbUser=await Users.findOne({username})
    if (dbUser===null){
        res.status(400)
        res.send(`User NOT exists`)
    }
    else {
        const isPasswordMatched=await bcrypt.compare(password,dbUser.password)
        if (isPasswordMatched){
            const payload={username:username}
            const jwtToken=await jwt.sign(payload,"SECRET")          //Sending JWT to client after successfull authentication
            res.send({jwtToken})
        }else {
            res.status(400)
            res.send(`Password is Incorrect`)
        }
    }
})



app.get("/users",authenticateToken,async (req,res)=>{            //Call the middleware function (authenticateToekn) to authenticated user based on the JWT
    const allUsers=await Users.find()
    res.send(allUsers)
})

app.get("/users/:username",authenticateToken,async (req,res)=>{
    const {username}=req.params
    const userDetails=await Users.find({username})
    res.send(userDetails)
})




app.listen(3000,()=>{console.log("Server is listening ...")})      //Listens to the "http://localhost:3000"
