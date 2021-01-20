require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
const fse = require('fs-extra')
var path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
var http = require('http');
const waterfall = require('async-waterfall');

paloAltoCurr = async(paloAltoinfo,cred,foldername)=>{
    try{
        return new Promise(async(resolve,reject)=>{
        waterfall([
            async function OrchestrationPaloAltoCurr(callback){//Palo Alto 
                try{
                await fs.promises.mkdir("./blob/"+foldername, { recursive: true }).then(res=>{
                stream = fs.createWriteStream("./blob/"+foldername+"/PaloAltoFirewall_Variable.tf")
                stream.write('provider "azurerm" { \n subscription_id    = "'+paloAltoinfo.subscriptionId+'"\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
                stream.write('\nvariable "resource_group_name" { \n type = "string"\n default = '+JSON.stringify(paloAltoinfo.basicConfig.resourceGroup)+'\n}')
                stream.write('\nvariable "location" { \n type = "string"\n default = '+JSON.stringify(paloAltoinfo.basicConfig.resourceLocation)+'\n}')
                stream.write('\nvariable "StorageAccountName" { \n type = "string"\n default = '+JSON.stringify(paloAltoinfo.basicConfig.storageAccount)+'\n}')
                stream.write('\nvariable "FirewallDnsName" { \n type = "string"\n default = '+JSON.stringify(paloAltoinfo.netConfig.dnsName)+'\n}')
                stream.write('\nvariable "FirewallVmName" { \n type = "string"\n default = '+JSON.stringify(paloAltoinfo.vmConfig.name)+'\n}')
                stream.write('\nvariable "FirewallVmSize" { \n type = "string"\n default = '+JSON.stringify(paloAltoinfo.vmConfig.vmSize)+'\n}')
                stream.write('\nvariable "FromGatewayLogin" { \n type = "string"\n default = '+JSON.stringify(paloAltoinfo.netConfig.gatewayAddress)+'\n}')
                stream.write('\nvariable "fwpublicIPName" {\n default = '+JSON.stringify(paloAltoinfo.netConfig.publicIP)+'\n}')
                stream.write('\nvariable "VirtualNetworkName" {\n default = '+JSON.stringify(paloAltoinfo.netConfig.virNetName)+'\n}')
                stream.write('\nvariable "VirtualNetworkAddressSapace" { \n type = "string"\n default = '+JSON.stringify(paloAltoinfo.netConfig.virNetAddress)+'\n}')
                stream.write('\nvariable "SubnetName1" {\n default = '+JSON.stringify(paloAltoinfo.netConfig.firstSubnet)+'\n}')
                stream.write('\nvariable "SubnetAddressPrefix1" {\n default = '+JSON.stringify(paloAltoinfo.netConfig.firstAddressSpace)+'\n}')
                stream.write('\nvariable "subnetName2" {\n default = '+JSON.stringify(paloAltoinfo.netConfig.secondSubnet)+'\n}')
                stream.write('\nvariable "SubnetAddressPrefix2" {\n default = '+JSON.stringify(paloAltoinfo.netConfig.secondAddressSpace)+'\n}')
                stream.write('\nvariable "SubnetName3" {\n default = '+JSON.stringify(paloAltoinfo.netConfig.thirdSubnet)+'\n}')
                stream.write('\nvariable "SubnetAddressPrefix3" {\n default = '+JSON.stringify(paloAltoinfo.netConfig.thirdAddressSpace)+'\n}')
                stream.write('\nvariable "fwSku" {\n default = '+JSON.stringify(paloAltoinfo.vmConfig.softwarePlan)+'\n}')
                stream.write('\nvariable "FWVersion" {\n default = '+JSON.stringify(paloAltoinfo.vmConfig.vmVersion)+'\n}')
                stream.write('\nvariable "adminUsername" {\n default = '+JSON.stringify(paloAltoinfo.vmConfig.userName)+'\n}')
                stream.write('\nvariable "adminPassword" {\n default = '+JSON.stringify(paloAltoinfo.vmConfig.cnfPassword)+'\n}')
                stream.write('\nvariable "imagePublisher" {\n default = "Canonical"\n}')
                stream.write('\nvariable "imageOffer" {\n default = "UbuntuServer"\n}')
                stream.write('\nvariable "ubuntuOSVersion" {\n default = "16.04-LTS"\n}')

                callback(null,'./TerraformResourceFiles/PaloAltoFirewall_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/PaloAltoFirewall_Variable.tf")
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
                    await paloAltoCurr(paloAltoinfo,cred,foldername).then((res)=>{
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
module.exports = {paloAltoCurr}