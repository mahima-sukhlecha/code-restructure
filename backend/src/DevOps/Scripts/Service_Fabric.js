require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
const fse = require('fs-extra')
var path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
var http = require('http');
const waterfall = require('async-waterfall');

serviceFabricCurr = async(info,cred,foldername)=>{
    try{
        return new Promise(async(resolve,reject)=>{
        waterfall([
        async function orchestrationServiceFabricCurr(callback){ // foldername -- Service Fabric
            try{
            await fs.promises.mkdir("./blob/"+foldername, { recursive: true }).then(res=>{
            stream = fs.createWriteStream("./blob/"+foldername+"/Service_Fabric_Variable.tf")
            stream.write('provider "azurerm" { \n subscription_id    = '+JSON.stringify(info.subscriptionId)+'\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
            stream.write('\nvariable "Resource_Group" { \n type = "string"\n default = '+JSON.stringify(info.ResourceGroupConfg.FabricsresourceGroupName)+'\n}')
            stream.write('\nvariable "location" { \n type = "string"\n default = '+JSON.stringify(info.ResourceGroupConfg.FabricsresourceGroupLocation)+'\n}')
            stream.write('\nvariable "VirtualNetwork-Name" { \n type = "string"\n default = '+JSON.stringify(info.VNetInfo.FabricsVnetName)+'\n}')
            stream.write('\nvariable "VirtualNetwork-AddressSapce" { \n type = "string"\n default = '+JSON.stringify(info.VNetInfo.FabricsAddressSpace)+'\n}')
            stream.write('\nvariable "Subnet-Name" { \n type = "string"\n default = '+JSON.stringify(info.VNetInfo.FabricsSubnetName)+'\n}')
            stream.write('\nvariable "Subnet-AdressSpace-default" { \n type = "string"\n default = '+JSON.stringify(info.VNetInfo.FabricsSubnetSpace)+'\n}')
            stream.write('\nvariable "clusterName" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.FabricsClusterName)+'\n}')
            stream.write('\nvariable "clusterloaction" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.FabricsLocation)+'\n}')
            stream.write('\nvariable "adminUsername" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.FabricsUserName)+'\n}')
           stream.write('\nvariable "adminPassword" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.Fabricspassword)+'\n}')
            stream.write('\nvariable "vmImageOffer" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.ImageOffere)+'\n}')
            stream.write('\nvariable "vmImageSku" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.ImageSKU)+'\n}')
            stream.write('\nvariable "certificateThumbprint" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.KeyVaultThumbPrint)+'\n}')
            stream.write('\nvariable "certificateUrlValue" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.KeyVaultThumbURL)+'\n}')
            stream.write('\nvariable "KeyVaultResourceId" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.KeyVaultResourceID)+'\n}')
            stream.write('\nvariable "ntInstanceCount" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.NodeInstance)+'\n}')
            stream.write('\nvariable "nodeTypeSize" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.NodeTypeSize)+'\n}')
            stream.write('\nvariable "durabilityLevel" { \n type = "string"\n default = '+JSON.stringify(info.FabricClusterConfig.DefficultyLevel)+'\n}')
        
            callback(null,'./src/DevOps/TerraformResourceFiles/Service_Fabric_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/Service_Fabric_Variable.tf")        
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
                await serviceFabricCurr(info,cred,foldername).then((res)=>{
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
module.exports = {serviceFabricCurr}
