require('dotenv').config();
var exports = module.exports = {};
var sql = require("mssql");
const request = require('request');
const bodyParser = require('body-parser')
var generator = require('generate-password');
//app.use(bodyParser.json())

//Sign Up in A3S
exports.registration =  async(req,res)=>{
    data = req.body
    await insertrecord().then((response)=>{
        res.send(response)
    }).catch((err)=>{
        res.status(400).send(err)
    })
}

async function insertrecord(){
    return new Promise ((resolve,reject)=>{
    var request = new sql.Request();
    var password = generator.generate({
        length: 10,
        numbers: true
    });
    ouId = data.userId.split("@").pop()
    request.query(`select * from admin_auth.loginauth where ou = '${ouId}'`,function(err,recordset){
        if(err){
            console.log("err",err)
        }else if(recordset.recordset.length === 0){
            request.query(`insert into admin_auth.loginauth (userId,uPassword,userName,organization,contactDetails,flag) values ('${data.userId}','${data.uPassword}','${data.userName}','${data.organization}','${data.contactDetails}',0)`, function (err, recordset) {
                if(err){
                    reject({"Error":"Already registered!"})
                }else{
                    console.log('insert')
                    console.log(recordset)
                    resolve({"Response":"Record Inserted"})
                }
            
            })
        }else{
            reject({"Error":"User with this organization is already registered"})
        }   
 })

})
}