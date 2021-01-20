require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
const fse = require('fs-extra')
var path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
const waterfall = require('async-waterfall');

wvdiCurr = async(wvdiinfo,cred,foldername)=>{
    try{
        return new Promise(async(resolve,reject)=>{
        waterfall([
            async function OrchestrationWVDICurr(callback){//WVDI
                try{
                await fs.promises.mkdir("./blob/"+foldername, { recursive: true }).then(res=>{
                stream =  fs.createWriteStream("./blob/"+foldername+"/WVDI_Variable.tf")
                stream.write('provider "azurerm" { \n subscription_id    = '+JSON.stringify(wvdiinfo.resource.subscriptionId)+'\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
                stream.write('\nvariable "subscription_id" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.resource.subscriptionId)+'\n}')
                stream.write('\nvariable "Resource_Group" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.resource.resourceGroup)+'\n}')
                stream.write('\nvariable "location" { \n default = '+JSON.stringify(wvdiinfo.resource.resourceLocation)+'\n}')
            
                stream.write('\nvariable "hostpoolName" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.hostpool.hostpoolName)+'\n}')
                stream.write('\nvariable "workSpaceName" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.workSpaceName)+'\n}')
                stream.write('\nvariable "administratorAccountUsername" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.administratorAccount.username)+'\n}')
                stream.write('\nvariable "administratorAccountPassword" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.administratorAccount.password)+'\n}')
            
                stream.write('\nvariable "vmSize" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.VirtualMachine.vmSize)+'\n}')
                stream.write('\nvariable "vmNumberOfInstances" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.VirtualMachine.vmNumberOfInstances)+'\n}')
                stream.write('\nvariable "vmNamePrefix" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.VirtualMachine.vmNamePrefix)+'\n}')
                stream.write('\nvariable "vmGalleryImageOffer" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.VirtualMachine.vmGalleryImageOffer)+'\n}')
                stream.write('\nvariable "vmGalleryImagePublisher" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.VirtualMachine.vmGalleryImagePublisher)+'\n}')
                stream.write('\nvariable "vmGalleryImageSKU" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.VirtualMachine.vmGalleryImageSKU)+'\n}')
            
                stream.write('\nvariable "existingaddsVnetName" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.VirtualNet.existingaddsVnetName)+'\n}')
                stream.write('\nvariable "existingSubnetName" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.VirtualNet.existingSubnetName)+'\n}')
                stream.write('\nvariable "virtualNetworkResourceGroupName" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.VirtualNet.VnetResourceGroupName)+'\n}')
                stream.write('\nvariable "ExistingVnetlocation" { \n type = "string"\n default ='+JSON.stringify(wvdiinfo.VirtualNet.ExistingVnetlocation)+'\n}')

                stream.write('\nvariable "hostpoolType" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.hostpool.hostpoolType)+'\n}')
                stream.write('\nvariable "personalDesktopAssignmentType" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.personalDesktopAssignmentType)+'\n}')
                stream.write('\nvariable "loadBalancerType" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.loadBalancerType)+'\n}')
                stream.write('\nvariable "domaintojoin" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.domaintojoin)+'\n}')
                stream.write('\nvariable "tokenExpirationTime" { \n type = "string"\n default = '+JSON.stringify(wvdiinfo.tokenExpirationTime)+'\n}')
            
                callback(null,'./src/Infrastructure/TerraformResourceFiles/WVDI_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/WVDI_Variable.tf")
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
                    await wvdiCurr(wvdiinfo,cred,foldername).then((res)=>{
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
 module.exports = {wvdiCurr}