// import mongoose from "mongoose";
// const connectDatabase = async () => {
//     try {
//         await mongoose.connect('mongodb://localhost:27017/cognilium');
//         console.log("database connected without any issue");
//     }catch(err){
//         console.log("ERROR OCCOURED WHILE CONNECTING TO DATABASE", err);
//     }
 
// };


// export default connectDatabase;

module.exports = {
  mongoURI:
    "mongodb+srv://serverBoiler:BrxyutmzqiCM4U6c@cluster0.t30x6.mongodb.net/CognilliumServer?retryWrites=true&w=majority",
  // this is my local Mongodb database
  secretOrKey: "secret",
};


