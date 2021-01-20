require('dotenv').config();
var exports = module.exports = {};
var fs = require("fs");
const fse = require('fs-extra')
var path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob');
var zipFolder = require('zip-folder')
var http = require('http');
const waterfall = require('async-waterfall');

azureKubernetesServiceCurr = async(info,cred,foldername)=>{
    try{
        return new Promise(async(resolve,reject)=>{
        waterfall([
        async function orchestrationAzureKubernetesServiceCurr(callback){ // foldername -- Azure Kubernetes Service
            try{
            await fs.promises.mkdir("./blob/"+foldername, { recursive: true }).then(res=>{
            stream = fs.createWriteStream("./blob/"+foldername+"/AKS_Variable.tf")
            stream.write('provider "azurerm" { \n subscription_id    = '+JSON.stringify(info.RegistryConfg.subscriptionId)+'\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')
            stream.write('\nvariable "resource_group_name" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.KubernetesResourceGroupInfo.KubernetesresourceGroupName)+'\n}')
            stream.write('\nvariable "location" {\n default = '+JSON.stringify(info.RegistryConfg.KubernetesResourceGroupInfo.KubernetesresourceGroupLocation)+'\n}')
            stream.write('\nvariable "AKSCluster-Loaction" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.KubernetesClusterInfo.KubernetesConfigureLocation)+'\n}')
            stream.write('\nvariable "AKS-DNS_service_ip" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.VirtualNetworkInfo.ServiceIPA)+'\n}')
            stream.write('\nvariable "docker_bridge_cidr" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.VirtualNetworkInfo.DockerBridge)+'\n}')
            stream.write('\nvariable "AKS-Service_cidr" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.VirtualNetworkInfo.ServiceAddRange)+'\n}')
            stream.write('\nvariable "client_id" { \n type = "string"\n default = "'+cred.clientId+'"\n}')
            stream.write('\nvariable "client_secret" { \n type = "string"\n default = "'+cred.clientSecret+'"\n}')
            stream.write('\nvariable "node_count_default_pool" {\n default = '+(info.RegistryConfg.KubernetesClusterInfo.KubernetesClusterNodeCount)+'\n}')
            stream.write('\nvariable "vm_size_default_pool" { \n default = '+JSON.stringify(info.RegistryConfg.KubernetesClusterInfo.KubernetesConfigureNodesize)+'\n}')
            stream.write('\nvariable "node_count_extranode_pool" { \n default = '+(info.RegistryConfg.KubernetesClusterInfo.KubernetesClusterExtraNodeCount)+'\n}')
            stream.write('\nvariable "vm_size_extranode_pool" { \n default = '+JSON.stringify(info.RegistryConfg.KubernetesClusterInfo.KubernetesClusterExtraNodeSize)+'\n}')
            stream.write('\nvariable "Linux_Admin_Username" {\n default = '+JSON.stringify(info.RegistryConfg.KubernetesClusterInfo.LinuxAdmin)+'\n}')
            stream.write('\nvariable "ssh_public_key" {\n default = '+JSON.stringify(info.RegistryConfg.KubernetesClusterInfo.KubernetesClusterSSHKey)+'\n}')
            stream.write('\nvariable "extranodeswindows" { \n default = '+JSON.stringify(info.RegistryConfg.KubernetesClusterInfo.KubernetesNodePoolOS)+'\n}')
            stream.write('\nvariable "dns_prefixName" {\n default = '+JSON.stringify(info.RegistryConfg.KubernetesClusterInfo.KubernetesClusterDNSName)+'\n}')
            stream.write('\nvariable "cluster_name" { \n default = '+JSON.stringify(info.RegistryConfg.KubernetesClusterInfo.KubernetesClusterName)+'\n}')
            stream.write('\nvariable "log_analytics_workspace_name" { \n default = '+JSON.stringify(info.RegistryConfg.MonitoringForm.LogAnalytics)+'\n}')
            stream.write('\nvariable "log_analytics_workspace_location" { \n default = '+JSON.stringify(info.RegistryConfg.MonitoringForm.LogAnalyticsLocation)+'\n}')
            stream.write('\nvariable "log_analytics_workspace_sku" { \n default = "PerGB2018" \n}')
            stream.write('\nvariable "VirtualNetwork-Name" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.VirtualNetworkInfo.VirtualNetworkName)+'\n}')
            stream.write('\nvariable "VirtualNetwork-AddressSapce" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.VirtualNetworkInfo.VirtualNetworkSpace)+'\n}')
            stream.write('\nvariable "Subnet-Name" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.VirtualNetworkInfo.SubnetName)+'\n}')
            stream.write('\nvariable "Subnet-AdressSpace-default" { \n type = "string"\n default = '+JSON.stringify(info.RegistryConfg.VirtualNetworkInfo.SubnetAddSpace)+'\n}')
            callback(null,'./src/DevOps/TerraformResourceFiles/AKS_Main.tf','./blob/'+foldername,foldername,"./blob/"+foldername+"/AKS_Variable.tf")
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
                await azureKubernetesServiceCurr(info,cred,foldername).then((res)=>{
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
 module.exports = {azureKubernetesServiceCurr}