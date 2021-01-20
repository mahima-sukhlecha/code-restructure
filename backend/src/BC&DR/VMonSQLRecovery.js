require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
const request = require('request');
var path = require('path')
var randomstring = require("randomstring");
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
var http = require('http');
const waterfall = require('async-waterfall');
const getRequest = require('../../utils/vnetStatus')

async function sendtoBlob(fileName,container_Client){
    return new Promise(async (resolve)=>{
    const blobName = './blob/'+fileName; //path
    var stats = fs.statSync('./blob/'+fileName)
    console.log(stats.size) 
    const blobServiceClient = await BlobServiceClient.fromConnectionString(process.env.blobConnectionString);
    // Get a reference to a container
    const containerClient = await blobServiceClient.getContainerClient(container_Client);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    fs.readFile(blobName, async function(err, data) {
        let arrayBuffer =  await Uint8Array.from(data);
        console.log(arrayBuffer.length)
        const uploadBlobResponse = await blockBlobClient.upload(arrayBuffer, arrayBuffer.length); 
        console.log('request-id',uploadBlobResponse.requestId);
        resolve('sucesss')
    });
})
}

sqlOnVMTerraform = async function(info,cred,filename,foldername){
    try{
        return new Promise(async(resolve,reject)=>{
        waterfall([
            async function OrchestrationSqlOnVMTerraform(callback){//sqlOnVMTerraform
                try{
                fileURI = 'https://storageaccountnilaya0f2.blob.core.windows.net/extras/'+filename
                await fs.promises.mkdir("./blob/"+foldername, { recursive: true }).then(res=>{
                stream = fs.createWriteStream("./blob/"+foldername+"/SQLVM_Variable.tf")
                stream.write('provider "azurerm" { \n subscription_id    = '+JSON.stringify(info.subscriptionId)+'\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
                stream.write('\nvariable "RG-Name" { \n type = "string"\n default = '+JSON.stringify(info.resource.resourceGroup)+'\n}')
                stream.write('\nvariable "RG-location" {\n default = '+JSON.stringify(info.resource.resourceLocation)+'\n}')
                
                stream.write('\nvariable "location" { \n type = "string"\n default = '+JSON.stringify(info.virtualNet.virNetLocation)+'\n}')
                stream.write('\nvariable "VNet-Name" { \n type = "string"\n default = '+JSON.stringify(info.virtualNet.virNetName)+'\n}')
                stream.write('\nvariable "VNet-address-space" { \n type = "string"\n default = '+JSON.stringify(info.virtualNet.virNetAddress)+'\n}')
            
                stream.write('\nvariable "Subnet-Name" { \n type = "string"\n default = '+JSON.stringify(info.virtualNet.subnetName)+'\n}')
                stream.write('\nvariable "subnetaddress-prefix" { \n type = "string"\n default = '+JSON.stringify(info.virtualNet.subnetAddress)+'\n}')
                stream.write('\nvariable "SQl-VM-size" { \n type = "string"\n default = '+JSON.stringify(info.virtualMC.vmSize)+'\n}')
                stream.write('\nvariable "publisher" { \n type = "string"\n default = '+JSON.stringify(info.vmImage.publisher)+'\n}')
                stream.write('\nvariable "offer" {\n default = '+JSON.stringify(info.vmImage.offer)+'\n}')
                
                stream.write('\nvariable "sku" { \n default = '+JSON.stringify(info.vmImage.sku)+'\n}')
                stream.write('\nvariable "computer_name" { \n default = '+JSON.stringify(info.virtualMC.computerName)+'\n}')
                stream.write('\nvariable "admin_username" {\n default = '+JSON.stringify(info.virtualMC.userName)+'\n}')
                stream.write('\nvariable "admin_password" {\n default = '+JSON.stringify(info.virtualMC.cnfPassword)+'\n}')
                stream.write('\nvariable "VM-Name" {\n default = '+JSON.stringify(info.virtualMC.vmName)+'\n}')
                stream.write('\nvariable "fileuri" {\n default = '+JSON.stringify(fileURI)+'\n}')
                stream.write('\nvariable "filename" {\n default = '+JSON.stringify(filename)+'\n}')
            
                callback(null,'./src/BC&DR/SQLVM_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/SQLVM_Variable.tf")
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
            async function sendtoBlob2(fileName,callback){
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
                    await sqlOnVMTerraform(info,cred,filename,foldername).then((res)=>{
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

exports.createRecoveryFile = async function(info,cred){
    return new Promise(async(resolve,reject)=>{
    folderName = "sqlrecovery"+randomstring.generate(5)+".ps1"
    stream = fs.createWriteStream("./blob/"+folderName)
    stream.write('[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12\n')
    stream.write('Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force\n')
    stream.write('Install-Module -Name SqlServer -AllowClobber -Force\n')
    stream.write(`Invoke-Sqlcmd -ServerInstance ${info.virtualMC.computerName} -Username ${info.virtualMC.userName} -Password ${info.virtualMC.cnfPassword} -Query " IF NOT EXISTS (SELECT * FROM sys.credentials WHERE name = '${info.data.blobUrl}')  CREATE CREDENTIAL [${info.data.blobUrl}] WITH IDENTITY = 'SHARED ACCESS SIGNATURE',  SECRET = '${info.data.blobSAS}';`)
    stream.write(`\nRESTORE DATABASE ${info.data.dbName}\n`)
    stream.write(`FROM URL = '${info.data.blobUrl}'\n`)
    stream.write(`WITH MOVE '${info.data.dbFileName}' to 'C:\\Program Files\\Microsoft SQL Server\\MSSQL14.MSSQLSERVER\\MSSQL\\DATA\\${info.data.dbName}.mdf',\nMOVE '${info.data.logFileName}' to 'C:\\Program Files\\Microsoft SQL Server\\MSSQL14.MSSQLSERVER\\MSSQL\\DATA\\${info.data.dbName}_Log.ldf';\n`)
    stream.write('GO "')
    stream.end();
    stream.on("finish",async()=>{
        response = await sendtoBlob(folderName,process.env.blobContainerClient_psScript)
        await sqlOnVMTerraform(info,cred,folderName,'SQLonVMRecovery'+randomstring.generate(5)).then((res)=>{
            resolve({
                "status":"done"
            })
        }).catch(err=>{
            reject(err)
        })

    })
})
    
    
}

exports.checkstatus = async function(req,res){
    try{
        reqData = req.body
        authToken = req.header('Authorization')
        url = `https://management.azure.com/subscriptions/${req.body.subscriptionId}/resourceGroups/${req.body.resourceGroupName}/providers/Microsoft.Compute/virtualMachines/${req.body.vmName}?api-version=2019-12-01`
        await getRequest.getAvailability(url,authToken).then((resData)=>{
                res.send({"ProvisioningState":resData.properties.provisioningState})
        }).catch((err)=>{
            console.log(err)
            res.status(400).send({"Error":err})
        })
    }catch(err){
        console.log(err)
		res.status(404).send('Something broke. Please Try Again !!')
    }


}

