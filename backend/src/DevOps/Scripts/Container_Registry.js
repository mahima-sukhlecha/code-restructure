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

exports.containerRegistryCurr = async function(info,cred,foldername){
    await fs.promises.mkdir("./blob/"+foldername, { recursive: true })
    stream = await fs.createWriteStream("./blob/"+foldername+"/Container_Registry_Variable.tf")
    stream.write('provider "azurerm" { \n subscription_id    = '+JSON.stringify(info.subscriptionId)+'\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
    stream.write('\nvariable "resource_group_name" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.resourceGroupName)+'\n}')
    stream.write('\nvariable "location" {\n default = '+JSON.stringify(info.RegistryConfg.resourceGroupLocation)+'\n}')
    stream.write('\nvariable "container_registery_location" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.contaainerRegistryLocation)+'\n}')
    stream.write('\nvariable "container_registery_name" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.containerregistryName)+'\n}')
    stream.write('\nvariable "container_registery_sku" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.containerregistrySKU)+'\n}')
    stream.write('\nvariable "Admin_Enable" { \n type = "string"\n default = '+(info.RegistryConfg.adminEnable)+'\n}')
        
    result = await copyFile('./src/DevOps/TerraformResourceFiles/Container_Registry_Main.tf','./blob/'+foldername,foldername)
    

    return({
        "status":"done"
    })
    
}