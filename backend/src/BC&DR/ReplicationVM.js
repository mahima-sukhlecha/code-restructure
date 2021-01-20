require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
const fse = require('fs-extra')
var path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
var http = require('http');
var AdmZip = require('adm-zip');
var randomstring = require("randomstring");
const waterfall = require('async-waterfall');

//replicationOfVM
replicationOfVM = async(info,cred,foldername)=>{
    try{
        return new Promise(async(resolve,reject)=>{
        waterfall([
            async function OrchestrationReplicationOfVM(callback){//ReplicationOfVM
                try{
                await fs.promises.mkdir("./blob/"+foldername, { recursive: true }).then(res=>{
                stream = fs.createWriteStream("./blob/"+foldername+"/VMReplicaton_Variable.tf")
                stream.write('provider "azurerm" { \n subscription_id    = '+JSON.stringify(info.subscriptionId)+'\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
                stream.write('\nvariable "Primary_RG" { \n type = "string"\n default = '+JSON.stringify(info.resourceGroup)+'\n}')
                stream.write('\nvariable "Primary_RG_location" {\n default = '+JSON.stringify(info.resourceLocation)+'\n}')
                stream.write('\nvariable "Secondary_RG" { \n type = "string"\n default = '+JSON.stringify(info.secRGName)+'\n}')
                stream.write('\nvariable "Secondary_RG_location" { \n type = "string"\n default = '+JSON.stringify(info.secRGLocation)+'\n}')
                stream.write('\nvariable "Primary_VM_location" { \n type = "string"\n default = '+JSON.stringify(info.vmLocation)+'\n}')
                stream.write('\nvariable "Recovery_Service_vault_Name" { \n type = "string"\n default = '+JSON.stringify(info.vaultName)+'\n}')
                stream.write('\nvariable "Storage_Account_Name" { \n type = "string"\n default = '+JSON.stringify(info.storageAccName)+'\n}')
                stream.write('\nvariable "Virtual_Machine_resourceid" { \n default = '+JSON.stringify(info.vmId)+'\n}')
                stream.write('\nvariable "VM_disk_OSDiskID" {\n default = '+JSON.stringify(info.osDiskId)+'\n}')
                if(JSON.stringify(info.vmDataDisk)){
                    stream.write('\nvariable "VM_disk_DataDiskID" {\n default = '+JSON.stringify(info.dataDiskID)+'\n}')
                    callback(null,'./src/BC&DR/VMReplication_multiple_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/VMReplicaton_Variable.tf")
                }else{
                    callback(null,'./src/BC&DR/VMReplicaton_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/VMReplicaton_Variable.tf")
                }
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
                    await replicationOfVM(info,cred,foldername).then((res)=>{
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

module.exports = {replicationOfVM}