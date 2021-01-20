require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
var fse = require("fs-extra")
var path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
var http = require('http');
var AdmZip = require('adm-zip');
const waterfall = require('async-waterfall');

storage_databaseCurr = async(dbinfo,cred,foldername)=>{
    try{
        return new Promise(async(resolve,reject)=>{
        waterfall([
        async function orchestration(callback){ // foldername -- Storage_DB
            try{
            await fs.promises.mkdir("./blob/"+foldername, { recursive: true }).then(res=>{
            sdbstream = fs.createWriteStream("./blob/"+foldername+"/Storage_DB_Variable.tf")
            sdbstream.write('provider "azurerm" { \n subscription_id    = "'+dbinfo.subscriptionId+'"\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
            sdbstream.write('\nvariable "Resource_Group" { \n type = "string"\n default = '+JSON.stringify(dbinfo.SA.ResourceGroup)+'\n}')
            sdbstream.write('\nvariable "location" { \n type = "string"\n default = '+JSON.stringify(dbinfo.SA.location)+'\n}')
            sdbstream.write('\nvariable "StorageAccountName" { \n type = "string"\n default = '+JSON.stringify(dbinfo.SA.strAccName)+'\n}')
            sdbstream.write('\nvariable "StorageAccountReplication" { \n type = "string"\n default = '+JSON.stringify(dbinfo.SA.strAccRep)+'\n}')
            sdbstream.write('\nvariable "SCALocation" { \n type = "string"\n default = '+JSON.stringify(dbinfo.SA.scaLocation)+'\n}')
            sdbstream.write('\nvariable "ServerName" { \n type = "string"\n default = '+JSON.stringify(dbinfo.DB.serverName)+'\n}')
            sdbstream.write('\nvariable "SQLLocation" { \n type = "string"\n default = '+JSON.stringify(dbinfo.DB.SqlLocation)+'\n}')
            sdbstream.write('\nvariable "AdministratorUserName" { \n type = "string"\n default = '+JSON.stringify(dbinfo.DB.SqlUsername)+'\n}')
            sdbstream.write('\nvariable "AdministratorPassword" { \n type = "string"\n default = '+JSON.stringify(dbinfo.DB.SqlPassword)+'\n}')
            sdbstream.write('\nvariable "DataBaseName" { \n type = "string"\n default = '+JSON.stringify(dbinfo.DB.SqlDatabase)+'\n}')
            sdbstream.write('\nvariable "SkuTier" { \n type = "string"\n default = "GeneralPurpose"\n}')
            sdbstream.write('\nvariable "SkuName" { \n type = "string"\n default = "GP_Gen5_2"\n}')
            
            callback(null, './src/DataETL/TerraformResourceFiles/Storage_DB_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/Storage_DB_Variable.tf")  
        })
        }catch(error){
            callback(error)
        }
    },
        function copyFile(file,dir,foldername,varFilePath,callback){
                var f = path.basename(file);
                var source =  fs.createReadStream(file);
                var dest =  fs.createWriteStream(path.resolve(dir, f));
                source.pipe(dest);
                source.on('end', async function() {
                    console.log('Succesfully copied');
                    mainFile = file.split("/").pop()
                    var stats = fs.statSync(dir+'/'+mainFile)
                    console.log("---->",stats.size); //Size of main file in blob folder
                    if(stats.size>0){
                        callback(null,foldername,varFilePath,stats.size)
                    }else{
                        callback("error")
                    }
                    
                 });
                source.on('error', function(err) { console.log(err);});

        },
        async function makeZip(foldername,varFilePath,mainFileSize,callback){
            var stats1 = fs.statSync(varFilePath)
            if(mainFileSize>0 && stats1.size>0 ){
                zipFolder('./blob/'+foldername, './blob/'+foldername+'.zip', async function(err) {
                    if(err) {
                        console.log('oh no!', err);
                    } else {
                        console.log('EXCELLENT');
                        //result = await sendtoBlob(foldername);
                        callback(null,foldername)
                    }
                });
            }else{
                callback("error")
            }
        },
        async function sendtoBlob(fileName,callback){
            fileName = fileName + '.zip';
            const blobName = './blob/'+fileName; //path
            const blobServiceClient =  BlobServiceClient.fromConnectionString(process.env.blobConnectionString);
            // Get a reference to a container
            const containerClient =  blobServiceClient.getContainerClient(process.env.blobContainerClient);
            const blockBlobClient = containerClient.getBlockBlobClient(fileName);
            fs.readFile(blobName, async function(err, data) {
                let arrayBuffer = Uint8Array.from(data);
                console.log(arrayBuffer.length);
                const uploadBlobResponse = await blockBlobClient.upload(arrayBuffer, arrayBuffer.length);
                console.log('request-id',uploadBlobResponse.requestId);
                callback(null,'sucesss')
            });
        }],async function(err,result){
            if(err){
                await storage_databaseCurr(dbinfo,cred,foldername).then((res)=>{
                    console.log("res",res)
                    resolve({"status":result})
                }).catch(err=>{
                    reject(err)
                })
            }else{
            resolve({"status":result})}
        })
    })
    }catch(err){
        console.log(err)
        reject({"Error":"Please Try Again !!"})
    }
}
module.exports = {storage_databaseCurr}