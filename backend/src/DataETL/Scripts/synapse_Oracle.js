require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
const fse = require('fs-extra')
var path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
var http = require('http');
const waterfall = require('async-waterfall');

oracle_SynapseCurr = async(orinfo,cred,foldername)=>{
    try{
        return new Promise(async(resolve,reject)=>{
        waterfall([
        async function OrchestrationOracle_SynapseCurr(callback){ // foldername -- Storage_DB
            try{
            await fs.promises.mkdir("./blob/"+foldername, { recursive: true }).then(res=>{
            orstream = fs.createWriteStream("./blob/"+foldername+"/Oracle_Synapse_Variable.tf")
            orstream.write('provider "azurerm" { \n subscription_id    = "'+orinfo.subscriptionId+'"\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
            orstream.write('\nvariable "Resource_Group" { \n type = "string"\n default = '+JSON.stringify(orinfo.ADF.ResourceGroup)+'\n}')
            orstream.write('\nvariable "location" { \n type = "string"\n default = '+JSON.stringify(orinfo.ADF.location)+'\n}')
            orstream.write('\nvariable "DataFactoryName" { \n type = "string"\n default = '+JSON.stringify(orinfo.ADF.ADFName)+'\n}')
            orstream.write('\nvariable "DataFactoryLocation" { \n type = "string"\n default = '+JSON.stringify(orinfo.ADF.ADFLocation)+'\n}')
            orstream.write('\nvariable "StorageConnectionString" { \n type = "string"\n default = '+JSON.stringify(orinfo.ADF.storageConnStr)+'\n}')
            orstream.write('\nvariable "AzureSynapseAnalyticsConnectionString" { \n type = "string"\n default = '+JSON.stringify(orinfo.Staging.synapseConnStr)+'\n}')
            orstream.write('\nvariable "Sources" { \n type = "string"\n default = '+JSON.stringify(orinfo.Staging.sources)+'\n}')
            orstream.write('\nvariable "Oracle_Host" { \n type = "string"\n default = '+JSON.stringify(orinfo.Oracle.oracleHost)+'\n}')
            orstream.write('\nvariable "Oracle_Port" { \n type = "string"\n default = '+JSON.stringify(orinfo.Oracle.oraclePort)+'\n}')
            orstream.write('\nvariable "Oracle_SID" { \n type = "string"\n default = '+JSON.stringify(orinfo.Oracle.oracleSID)+'\n}')
            orstream.write('\nvariable "Oracle_Username" { \n type = "string"\n default = '+JSON.stringify(orinfo.Oracle.username)+'\n}')
            orstream.write('\nvariable "Oracle_Password" { \n type = "string"\n default = '+JSON.stringify(orinfo.Oracle.password)+'\n}')
            orstream.write('\nvariable "OracleTables" { \n type = "string"\n default = <<-EOF\n'+JSON.stringify(orinfo.Oracle.tables)+'\nEOF\n}')
                
            callback(null,'./src/DataETL/TerraformResourceFiles/Oracle_Synapse_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/Oracle_Synapse_Variable.tf")  
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
                await oracle_SynapseCurr(orinfo,cred,foldername).then((res)=>{
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
module.exports = {oracle_SynapseCurr}