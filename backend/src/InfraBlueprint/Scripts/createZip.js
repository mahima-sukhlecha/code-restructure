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
    try{
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
    }catch(err){
        console.log('Error: ',err)
    }  
} 

async function sendtoBlob(fileName){
    try{
        return new Promise(async (resolve)=>{
            fileName = fileName + '.zip';
            const blobName = './blob/'+fileName; //path
            const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.blobConnectionString);
            // Get a reference to a container
            const containerClient = blobServiceClient.getContainerClient(process.env.blobContainerClient);
            const blockBlobClient = containerClient.getBlockBlobClient(fileName);
            fs.readFile(blobName, async function(err, data) {
                let arrayBuffer =  Uint8Array.from(data);
                console.log(arrayBuffer.length);
                const uploadBlobResponse = await blockBlobClient.upload(arrayBuffer, arrayBuffer.length);
                console.log('request-id',uploadBlobResponse.requestId);
                resolve('sucesss')
            });
        })
    }catch(err){
        console.log('Error: ',err)
    }    
}

function copyFile(file,dir,foldername){
    try{
        return new Promise(async (resolve)=>{
            var f = path.basename(file);
            var source = fs.createReadStream(file);
            var dest =  fs.createWriteStream(path.resolve(dir, f));
            source.pipe(dest);
            source.on('end', async function() {

                mainFile = file.split("/").pop()
                var stats = fs.statSync(dir+'/'+mainFile)
                console.log("mainFile---->",stats.size); //Size of main file in blob folder

                if(stats.size>0){
                    console.log('Succesfully copied');
                    // result = await makeZip(foldername)
                }else{
                    await copyFile(file,dir,foldername)
                }

             });
            source.on('error', function(err) { console.log(err); });
    
            resolve('success')
    
        })
    }catch(err){
        console.log('Error: ',err)
    }
}

module.exports = { makeZip, copyFile }