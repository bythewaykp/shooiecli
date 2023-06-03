// let axios = require('axios')
// const mongoose = require('mongoose');

module.exports = async (client, msg, Vars) => {
  let url =
    "mongodb+srv://kphere:KPabhi%40129AjMo@cluster0.1eyds.mongodb.net/test";

  mongoose
    .connect(url)
    .then(async () => {
      const Vars = mongoose.model(
        "var",
        new mongoose.Schema({
          id: String,
          all: Boolean,
        })
      );

      const fluffy = new Vars({
        id: "12345",
        all: true,
      });
      // await fluffy.save();
      let a = await Vars.find();
      console.log(a);

      // let doc = await Kitten.findOne({id:'12345'})
      // await Kitten.findOneAndUpdate({id:'12345'}, {all:false});

      // await Kitten.deleteOne({id:'12345'})
      // .then(()=>{
      //     console.log("deleted"); // Success
      // }).catch((e)=>{
      //     console.log(e);
      // });

      // let doc = await Kitten.findOne({id:'12345'})
      // console.log(doc.all);
    })
    .catch((e) => console.log(e));

  //     await msg.react('⚡');

  //     if(msg.fromMe){

  //         if(t['all']){

  //             if(vars.all){

  //                 if(t['all']==1){
  //                     await msg.reply('_nippi_ already listens for everyone')
  //                 }
  //                 else if(t['all']==0){
  //                     await axios.patch(`http://localhost:3000/vars`,{
  //                         ...vars,
  //                         all:false
  //                     }).then(async r=>{
  //                         await msg.reply('_nippi_ now listens just the owner')
  //                     }).catch((e)=>{
  //                         console.log('error');
  //                     })
  //                 }

  //             }
  //             else{
  //                 if(t['all']==1){

  //                     await axios.patch(`http://localhost:3000/vars`,{
  //                         ...vars,
  //                         all:true
  //                     }).then(async r=>{
  //                         await msg.reply('_nippi_ now listens for everyone')
  //                     }).catch((e)=>{
  //                         console.log('error');
  //                     })
  //                 }
  //                 else{
  //                     await msg.reply('_nippi_ already listens just the owner')
  //                 }
  //             }
  //         }
  //         else{
  //             if(vars.all){
  //                 await msg.reply('_nippi_ listens for everyone')
  //             }
  //             else{
  //                 await msg.reply('_nippi_ just listens the owner')
  //             }
  //         }
  //     }
  //     //message not fromMe
  //     else{
  //         if(t['all']){
  //             await msg.reply('you do not have priviledge to change user roles')
  //         }
  //         else{
  //             if(vars.all){
  //                 await msg.reply('_nippi_ listens for everyone')
  //             }
  //             else{
  //                 // console.log('other');
  //                 let mentions = [await client.getContactById(client.info.wid._serialized)]
  //                 await msg.reply(
  // `_nippi_ just listens the owner`
  //                 ,null,{mentions})
  //             }
  //         }
  //     }
};
