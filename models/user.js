const mongoose=require('mongoose')

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('database is connectes')
})
.catch((err)=>console.log(err))
const Schema = mongoose.Schema;


const User= new Schema({

  name: String,
  email: String,
  password: String,
  posts:[
    {type:mongoose.Schema.Types.ObjectId,ref:"post"}//make arrya which store id of post and refer self from post schema consept of foreigen key
    
  ]
});

module.exports= mongoose.model("User", User);