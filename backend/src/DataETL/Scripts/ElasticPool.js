require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
const fse = require('fs-extra')
var path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
var http = require('http');
const waterfall = require('async-waterfall');

storage_elasticpoolCurr = async(epinfo,cred,foldername)=>{
    try{
        return new Promise(async(resolve,reject)=>{
        waterfall([
        async function OrchestrationStorage_elasticpoolCurr(callback){ // foldername -- Storage_DB
            try{
            await fs.promises.mkdir("./blob/"+foldername, { recursive: true }).then(res=>{
            epstream =  fs.createWriteStream("./blob/"+foldername+"/Elasticpool_Variable.tf")
            epstream.write('provider "azurerm" { \n subscription_id    = "'+epinfo.subscriptionId+'"\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
            epstream.write('\nvariable "Resource_Group" { \n type = "string"\n default = '+JSON.stringify(epinfo.SA.ResourceGroup)+'\n}')
            epstream.write('\nvariable "location" { \n type = "string"\n default = '+JSON.stringify(epinfo.SA.location)+'\n}')
            epstream.write('\nvariable "StorageAccountName" { \n type = "string"\n default = '+JSON.stringify(epinfo.SA.strAccName)+'\n}')
            epstream.write('\nvariable "StorageAccountReplication" { \n type = "string"\n default = '+JSON.stringify(epinfo.SA.strAccRep)+'\n}')
            epstream.write('\nvariable "SCALocation" { \n type = "string"\n default = '+JSON.stringify(epinfo.SA.scaLocation)+'\n}')
            epstream.write('\nvariable "ServerName" { \n type = "string"\n default = '+JSON.stringify(epinfo.EP.serverName)+'\n}')
            epstream.write('\nvariable "SQLLocation" { \n type = "string"\n default = '+JSON.stringify(epinfo.EP.SqlLocation)+'\n}')
            epstream.write('\nvariable "administratorLogin" { \n type = "string"\n default = '+JSON.stringify(epinfo.EP.adminlogin)+'\n}')
            epstream.write('\nvariable "administratorLoginPassword" { \n type = "string"\n default = '+JSON.stringify(epinfo.EP.adminpssw)+'\n}')
            epstream.write('\nvariable "DataBaseName" { \n type = "string"\n default = '+JSON.stringify(epinfo.EP.dbname)+'\n}')
            epstream.write('\nvariable "elasticPoolName" { \n type = "string"\n default = '+JSON.stringify(epinfo.EP.epname)+'\n}')
            epstream.write('\nvariable "tier" { \n type = "string"\n default = "GeneralPurpose"\n}')
            epstream.write('\nvariable "SkuName" { \n type = "string"\n default = "GP_Gen5_2"\n}')
        
            callback(null,'./src/DataETL/TerraformResourceFiles/Elasticpool_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/Elasticpool_Variable.tf")
              
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
                await storage_elasticpoolCurr(epinfo,cred,foldername).then((res)=>{
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
module.exports = {storage_elasticpoolCurr}