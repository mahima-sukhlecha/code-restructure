require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
const fse = require('fs-extra')
var path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
var http = require('http');
const waterfall = require('async-waterfall');

funcAppCurr = async(info,cred,foldername)=>{
    try{
        return new Promise(async(resolve,reject)=>{
        waterfall([
            async function OrchestrationFuncAppCurr(callback){//Function App
                try{
                await fs.promises.mkdir("./blob/"+foldername, { recursive: true }).then(res=>{
                stream =  fs.createWriteStream("./blob/"+foldername+"/FunctionApp_Variable.tf")
                stream.write('provider "azurerm" { \n subscription_id    = "'+info.subscriptionId+'"\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
                stream.write('\nvariable "Resource_Group" { \n type = "string"\n default = '+JSON.stringify(info.resource.resourceGroup)+'\n}')
                stream.write('\nvariable "Location" {\n default = '+JSON.stringify(info.resource.resourceLocation)+'\n}')
            
                stream.write('\nvariable "functionapp_Location" {\n default = '+JSON.stringify(info.function.location)+'\n}')
            
                stream.write('\nvariable "kind" { \n type = "string"\n default = '+JSON.stringify(info.function.kind)+'\n}')
                stream.write('\nvariable "reserved" { \n type = "string"\n default = '+JSON.stringify(info.function.reserved)+'\n}')
                stream.write('\nvariable "Function_App_name" { \n type = "string"\n default = '+JSON.stringify(info.function.name)+'\n}')
                stream.write('\nvariable "SKU" { \n type = "string"\n default = '+JSON.stringify(info.function.SKU)+'\n}')
                stream.write('\nvariable "Size_App_Service_Plan" { \n type = "string"\n default = '+JSON.stringify(info.function.tier)+'\n}')
                stream.write('\nvariable "FUNCTIONS_WORKER_RUNTIME" { \n type = "string"\n default = '+JSON.stringify(info.function.runTimeStack)+'\n}')
            
                callback(null,'./src/iPaaS/TerraformResourceFiles/FunctionApp_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/FunctionApp_Variable.tf")
                    
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
                    await funcAppCurr(info,cred,foldername).then((res)=>{
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

module.exports = {funcAppCurr}

