require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
const fse = require('fs-extra')
var path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
var http = require('http');
const waterfall = require('async-waterfall');
//create synapse
//In destination
//2&3 form of UI
dataWarehouseCurr = async(dwinfo,cred,foldername)=>{
    try{
        return new Promise(async(resolve,reject)=>{
        waterfall([
        async function OrchestrationDataWarehouseCurr(callback){ // foldername -- Storage_DB
            try{
            await fs.promises.mkdir("./blob/"+foldername, { recursive: true }).then(res=>{
            dwstream = fs.createWriteStream("./blob/"+foldername+"/Storage_DW_Variable.tf")
            dwstream.write('provider "azurerm" { \n subscription_id    = "'+dwinfo.subscriptionId+'"\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
            dwstream.write('\nvariable "Resource_Group" { \n type = "string"\n default = '+JSON.stringify(dwinfo.SA.ResourceGroup)+'\n}')
            dwstream.write('\nvariable "location" { \n type = "string"\n default = '+JSON.stringify(dwinfo.SA.location)+'\n}')
            dwstream.write('\nvariable "StorageAccountName" { \n type = "string"\n default = '+JSON.stringify(dwinfo.SA.strAccName)+'\n}')
            dwstream.write('\nvariable "StorageAccountReplication" { \n type = "string"\n default = '+JSON.stringify(dwinfo.SA.strAccRep)+'\n}')
            dwstream.write('\nvariable "SCALocation" { \n type = "string"\n default = '+JSON.stringify(dwinfo.SA.scaLocation)+'\n}')
        
            dwstream.write('\nvariable "sqlServerName" { \n type = "string"\n default = '+JSON.stringify(dwinfo.DW.serverName)+'\n}')
            dwstream.write('\nvariable "SQLdatawarehouselocation" { \n type = "string"\n default = '+JSON.stringify(dwinfo.DW.location)+'\n}')
        
            dwstream.write('\nvariable "sqlAdministratorLogin" { \n type = "string"\n default = '+JSON.stringify(dwinfo.DW.SqlAdminLogin)+'\n}')
            dwstream.write('\nvariable "sqlAdministratorPassword" { \n type = "string"\n default = '+JSON.stringify(dwinfo.DW.conPassword)+'\n}')
            dwstream.write('\nvariable "transparentDataEncryption" { \n type = "string"\n default = '+JSON.stringify(dwinfo.DW.TransDataEnc)+'\n}')
            dwstream.write('\nvariable "dataWarehouseName" { \n type = "string"\n default = '+JSON.stringify(dwinfo.DW.dbName)+'\n}')
            
            callback(null, './src/DataETL/TerraformResourceFiles/Storage_DW_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/Storage_DW_Variable.tf")  
        })
        }catch(error){
            callback(error)
        }
    },
        function copyFile(file,dir,foldername,varFilePath,callback){
            mainFile = file.split("/").pop()
            fs.copyFileSync(file, dir+"/"+mainFile);
            console.log('source.txt was copied to destination.txt');
                // var f = path.basename(file);
                // var source =  fs.createReadStream(file);
                // var dest =  fs.createWriteStream(path.resolve(dir, f));
                // source.pipe(dest);
                // source.on('end', async function() {
                //     console.log('Succesfully copied');
                //     mainFile = file.split("/").pop()
                    var stats = fs.statSync(dir+'/'+mainFile)
                    console.log("---->",stats.size); //Size of main file in blob folder
                    if(stats.size>0){
                        callback(null,foldername,varFilePath,stats.size)
                    }else{
                        callback("error")
                    }
                    
                //  });
                // source.on('error', function(err) { console.log(err);});

        },
        async function makeZip(foldername,varFilePath,mainFileSize,callback){
            var stats1 = fs.statSync(varFilePath)
            console.log("----------->",stats1.size)
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
                await dataWarehouseCurr(dwinfo,cred,foldername).then((res)=>{
                    console.log("res",res)
                    resolve({"status":res})
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
module.exports = {dataWarehouseCurr}

    
    


