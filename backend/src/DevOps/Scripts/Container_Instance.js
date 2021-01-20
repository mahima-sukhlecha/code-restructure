require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
const fse = require('fs-extra')
var path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
var http = require('http');
var AdmZip = require('adm-zip');

async function makeZip(foldername){
    return new Promise(async (resolve)=>{
    zipFolder('./blob/'+foldername, './blob/'+foldername+'.zip', async function(err) {
        if(err) {
            console.log('oh no!', err);
        } else {
            console.log('EXCELLENT');
            result = await sendtoBlob(foldername);
            resolve('success')
        }
    });
})
}

async function sendtoBlob(fileName){
    return new Promise(async (resolve)=>{
    fileName = fileName + '.zip';
    const blobName = './blob/'+fileName; //path
    const blobServiceClient = await BlobServiceClient.fromConnectionString(process.env.blobConnectionString);
    // Get a reference to a container
    const containerClient = await blobServiceClient.getContainerClient(process.env.blobContainerClient);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    fs.readFile(blobName, async function(err, data) {
        let arrayBuffer =  await Uint8Array.from(data);
        console.log(arrayBuffer.length);
        const uploadBlobResponse = await blockBlobClient.upload(arrayBuffer, arrayBuffer.length); 
        console.log('request-id',uploadBlobResponse.requestId);
        resolve('sucesss')
    });
})
}

function copyFile(file,dir,foldername){
    return new Promise(async (resolve)=>{
        var f = path.basename(file);
        var source = await fs.createReadStream(file);
        var dest =  await fs.createWriteStream(path.resolve(dir, f));
        source.pipe(dest);
        source.on('end', async function() { 
            console.log('Succesfully copied');
            result = await makeZip(foldername)
         });
        source.on('error', function(err) { console.log(err); });
        
        resolve('success')

    })

    
}

exports.containerInstanceCurr = async function(info,cred,foldername){
    console.log(info)
    await fs.promises.mkdir("./blob/"+foldername, { recursive: true })
    stream = await fs.createWriteStream("./blob/"+foldername+"/Container_Instance_Variable.tf")
    stream.write('provider "azurerm" { \n subscription_id    = '+JSON.stringify(info.subscriptionId)+'\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
    stream.write('\nvariable "Resource_Group" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceResourceGroupInfo.ACIresourceGroupName)+'\n}')
    stream.write('\nvariable "location" {\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceResourceGroupInfo.ACIresourceGroupLocation)+'\n}')
    stream.write('\nvariable "Conatiner-Instance-Name" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceInfo.ContainerInstanceName)+'\n}')
    stream.write('\nvariable "Conatiner-Instance-location" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceInfo.ContainerInstanceLocation)+'\n}')
    stream.write('\nvariable "DNS-Name" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceInfo.ContainerInstanceDNSName)+'\n}')
    stream.write('\nvariable "OS-type" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceInfo.ControlInstanceOS)+'\n}')
    stream.write('\nvariable "Conatiner-Name" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceInfo.ControlInstanceContainerName)+'\n}')
    stream.write('\nvariable "Conatiner-Image" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceInfo.ControlInstanceContainerImage)+'\n}')
    stream.write('\nvariable "CPU" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceInfo.ControlInstanceCPUCore)+'\n}')
    stream.write('\nvariable "Memory" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceInfo.ControlInstanceMemory)+'\n}')
    stream.write('\nvariable "Port-number" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceInfo.ControlInstancePortNumber)+'\n}')
    stream.write('\nvariable "Protocol" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.ContainerInstanceInfo.ContainerInstanceProtocol)+'\n}')
        
    result = await copyFile('./src/DevOps/TerraformResourceFiles/Container_Instance_Main.tf','./blob/'+foldername,foldername)
    

    return({
        "status":"done"
    })
    
}