require('dotenv').config();
var fs = require("fs");
var createZip = require('./createZip');

async function blueprintCurr(info,cred,foldername) {
    var flag =false
    var count =0

    if(info["VM"] || info["Logic App"] || info["Function App"] || info["APIM"] || info["AppService"]) {
        await fs.promises.mkdir("./blob/"+foldername, { recursive: true })
        stream = fs.createWriteStream("./blob/"+foldername+"/Blueprint_Variable.tf")
        stream.write('provider "azurerm" { \n subscription_id    = "'+info.subscriptionId+'"\n client_id       = "'+cred.clientId+'"\n client_secret   = "'+cred.clientSecret+'"\n tenant_id       = "'+cred.tenantId+'"\n}')     
        
        if (info["VM"]) {
            stream.write('\nvariable "subscription_id" { \n type = "string"\n default = "'+info.subscriptionId+'" \n}')
            await VM_Variable(info["VM"],foldername,stream);
            result = await createZip.copyFile('./src/InfraBlueprint/TerraformResourceFiles/blueprint_VM_Main.tf','./blob/'+foldername,foldername) 
            flag = true
            count+=1
        }
        if(info["Logic App"]) {
            await LogicApp_Variable(info["Logic App"],foldername,stream);
            result = await createZip.copyFile('./src/InfraBlueprint/TerraformResourceFiles/blueprint_LogicApp_Main.tf','./blob/'+foldername,foldername) 
            flag = true
            count+=1
        }
        if(info["Function App"]) {
            await FunctionApp_Variable(info["Function App"],foldername,stream);
            result = await createZip.copyFile('./src/InfraBlueprint/TerraformResourceFiles/blueprint_FunctionApp_Main.tf','./blob/'+foldername,foldername) 
            flag = true
            count+=1
        }
        if(info["APIM"]) {
            await APIM_Variable(info["APIM"],foldername,stream);
            result = await createZip.copyFile('./src/InfraBlueprint/TerraformResourceFiles/blueprint_APIM_Main.tf','./blob/'+foldername,foldername) 
            flag = true
            count+=1
        }
        if(info["AppService"]) {
            await AppService_Variable(info["AppService"],foldername,stream);
            result = await createZip.copyFile('./src/InfraBlueprint/TerraformResourceFiles/blueprint_AppService_Main.tf','./blob/'+foldername,foldername) 
            flag = true
            count+=1
        }

        if(flag){ //flag is true

            if(count===info.no_of_resources){
                var var_stats = fs.statSync('./blob/'+foldername+'/Blueprint_Variable.tf')
                console.log("variableFile---->",var_stats.size); //Size of variable file in blob folder

                if(var_stats.size>0){
                    var result = await createZip.makeZip(foldername)  
                }else {
                    var result = await blueprintCurr(info,cred,foldername)      }   

            }else{
                var result = await blueprintCurr(info,cred,foldername)    
            }            
        } 

    }
    return({
        "status":"done"
    })
}



async function VM_Variable (info,foldername,stream){
    return new Promise(async (resolve)=>{

        var variableString =
    `\nvariable "RG-1-Name" { \n type = "string"\n default = ${JSON.stringify(info['Resource Group Name*'])}\n}
    \nvariable "RG-1-Location" { \n type = "string"\n default = ${JSON.stringify(info['Resource Group Location*'])}\n}
    \nvariable "VNET-1-Name" { \n type = "list"\n default = ${JSON.stringify(info['Virtual Network Name*'])}\n}
    \nvariable "VNET-1-Location" { \n type = "list"\n default = ${JSON.stringify(info['Virtual Network Location*'])}\n}
    \nvariable "VNET-1-CIDR" { \n type = "list"\n default = ${JSON.stringify(info['Virtual Network Address Space'])}\n}
    \nvariable "Subnet-Name-1A" {\n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['Subnet Name*'])}\n}
    \nvariable "Subnet-CIDR-1A" { \n description = "Subnet-Address Space"\n type = "list"\n default = ${JSON.stringify(info['Subnet Address Space'])}\n}
    
    \nvariable "AzureFirewallVnet" { \n type = "list"\n default = ${JSON.stringify(info['Azure Firewall Vnet'])}\n}
    \nvariable "AzureFirewallSubnet" { \n description = "Azure firewall Subnet Name"\n type = "list"\n default = ${JSON.stringify(info['Firewall Subnet Name*'])}\n}
    \nvariable "AzureFirewallSubnet-CIDR" { \n description = "Azure Firewall Subnet-Address Space"\n type = "list"\n default = ${JSON.stringify(info['Firewall Subnet Address Space'])}\n}
    \nvariable "AzureFirewallName" { \n description = "Azure Firewall Name" \n type = "list"\n default = ${JSON.stringify(info['Firewall Name*'])}\n}
    \nvariable "LoadBalncerName" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['Load Balancer Name*'])}\n}
    \nvariable "VM-Count" { \n description = "Names" \n type = "string"\n default = "${(JSON.stringify(info['Virtual Machine Name*'].length))}"\n}
    \nvariable "VM-Location-WIN" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['Virtual Machine Location for Win'])}\n}

    //Windows VM Configuration
    \nvariable "WIN-VNET-Name-NonAvlset" { \n type = "list"\n default = ${JSON.stringify(info['WIN-VNet Name'])}\n}
    \nvariable "WIN-Subnet-Name-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['WIN-Subnet Name'])}\n}
    \nvariable "WIN-VM-Name-NonAvlset" { \n description = "VMs in Non Availability Set" \n type = "list"\n default = ${JSON.stringify(info['WIN-VM Name'])}\n}
    \nvariable "WIN-VM-Size-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['WIN-VM Size'])}\n}
    \nvariable "WIN-VM-ComputerName-NonAvlset" { \n description = "Virtual Machines Computer Names" \n type = "list"\n default = ${JSON.stringify(info['WIN-Computer Name'])}\n}
    \nvariable "WIN-VM-UN-NonAvlset" { \n description = "Usernames" \n type = "list"\n default = ${JSON.stringify(info['WIN-Username'])}\n}
    \nvariable "WIN-VM-PW-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['WIN-Password'])}\n}
    \nvariable "WIN-VM-Publisher-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['WIN-VM Publisher'])}\n}
    \nvariable "WIN-VM-Offer-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['WIN-VM Offer'])}\n}
    \nvariable "WIN-VM-Sku-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['WIN-VM SKU'])}\n}

    //Linux VM Configuration
    \nvariable "LNX-VNET-Name-NonAvlset" { \n type = "list"\n default = ${JSON.stringify(info['LNX-VNet Name'])}\n}
    \nvariable "LNX-Subnet-Name-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['LNX-Subnet Name'])}\n}
    \nvariable "LNX-VM-Name-NonAvlset" { \n description = "VMs in Non Availability Set" \n type = "list"\n default = ${JSON.stringify(info['LNX-VM Name'])}\n}
    \nvariable "LNX-VM-Size-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['LNX-VM Size'])}\n}
    \nvariable "LNX-VM-ComputerName-NonAvlset" { \n description = "Virtual Machines Computer Names" \n type = "list"\n default = ${JSON.stringify(info['LNX-Computer Name'])}\n}
    \nvariable "LNX-VM-UN-NonAvlset" { \n description = "Usernames" \n type = "list"\n default = ${JSON.stringify(info['LNX-Username'])}\n}
    \nvariable "LNX-VM-PW-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['LNX-Password'])}\n}
    \nvariable "LNX-VM-Publisher-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['LNX-VM Publisher'])}\n}
    \nvariable "LNX-VM-Offer-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['LNX-VM Offer'])}\n}
    \nvariable "LNX-VM-Sku-NonAvlset" { \n description = "Names" \n type = "list"\n default = ${JSON.stringify(info['LNX-VM SKU'])}\n}
    \nvariable "VM_TagsKey-proj" { \n type = "list"\n default = ${JSON.stringify(info['Tag 1 Key'])}\n}
    \nvariable "VM_TagsValue-proj" { \n type = "list"\n default = ${JSON.stringify(info['Tag 1 Value'])}\n}
    \nvariable "VM_TagsKey-env" { \n type = "list"\n default = ${JSON.stringify(info['Tag 2 Key'])}\n}
    \nvariable "VM_TagsValue-env" { \n type = "list"\n default = ${JSON.stringify(info['Tag 2 Value'])}\n}`
    stream.write(variableString)

    resolve('success')
    })
    
}


async function LogicApp_Variable (info,foldername,stream){
    return new Promise(async (resolve)=>{

    var variableString =
      `\nvariable "LogicApp_Resource_Name" { \n description = "Enter the Purpose for creating a resource" \n type = "list"\n default = ${JSON.stringify(info['Resource Group Name*'])} \n}
      \nvariable "logicAppRG_Location" { \n type = "list"\n default = ${JSON.stringify(info['Resource Group Location*'])}\n}
      \nvariable "Logic-App" { \n description = "Enter the Purpose for creating a resource" \n type = "list" \n default = ${JSON.stringify(info['Logic App Name*'])}\n}
      \nvariable "LogicApp-Location" { \n type = "list"\n default = ${JSON.stringify(info['Logic App Location*'])}\n}
      \nvariable "LogicAppCount" {\n type = "string"\n default = "${JSON.stringify(info['Logic App Name*'].length)}"\n}
      \nvariable "Logicapp_TagsKey-proj" { \n type = "list"\n default = ${JSON.stringify(info['Tag 1 Key'])}\n}
      \nvariable "LogicApp_TagsValue-proj" { \n type = "list"\n default = ${JSON.stringify(info['Tag 1 Value'])}\n}
      \nvariable "Logicapp_TagsKey-env" { \n type = "list"\n default = ${JSON.stringify(info['Tag 2 Key'])}\n}
      \nvariable "LogicApp_TagsValue-env" { \n type = "list"\n default = ${JSON.stringify(info['Tag 2 Value'])}\n}`
      stream.write(variableString)

    resolve('success')
    })
}


async function FunctionApp_Variable (info,foldername,stream){
    return new Promise(async (resolve)=>{

        var variableString =
    `\nvariable "FunctApp_Resource_Group" { \n type = "list"\n default = ${JSON.stringify(info['Resource Group Name*'])}\n}
    \nvariable "FunctApp_RG_Location" { \n type = "list"\n default = ${JSON.stringify(info['Resource Group Location*'])}\n}
    \nvariable "functionapp_Location" {\n type = "list"\n default = ${JSON.stringify(info['Function App Location*'])}\n}
    \nvariable "kind" { \n type = "list"\n default = ${JSON.stringify(info['Kind'])}\n}
    \nvariable "reserved" { \n type = "list"\n default = ${JSON.stringify(info['Function App OS*'])}\n}
    \nvariable "Function_App_name" { \n type = "list"\n default = ${JSON.stringify(info['Function App Name*'])}\n}
    \nvariable "FunctioAppCount" {\n type = "string"\n default = "${JSON.stringify(info['Function App Name*'].length)}"\n}
    \nvariable "SKU" { \n type = "list"\n default = ["Dynamic"]\n}
    \nvariable "Size_App_Service_Plan" { \n type = "list"\n default = ["Y1"]\n}
    \nvariable "FUNCTIONS_WORKER_RUNTIME" { \n type = "list"\n default = ${JSON.stringify(info['Function App Runtime Stack*'])}\n}
    \nvariable "FunctionApp_TagsKey-proj" { \n type = "list"\n default = ${JSON.stringify(info['Tag 1 Key'])}\n}
    \nvariable "FunctionApp_TagsValue-proj" { \n type = "list"\n default = ${JSON.stringify(info['Tag 1 Value'])}\n}
    \nvariable "FunctionApp_TagsKey-env" { \n type = "list"\n default = ${JSON.stringify(info['Tag 2 Key'])}\n}
    \nvariable "FunctionApp_TagsValue-env" { \n type = "list"\n default = ${JSON.stringify(info['Tag 2 Value'])}\n}`
    stream.write(variableString)

    resolve('success')
    })
}


async function APIM_Variable (info,foldername,stream){
    return new Promise(async (resolve)=>{

        var variableString =
    `\nvariable "APIM_Resource_Group" { \n type = "list"\n default = ${JSON.stringify(info['Resource Group Name*'])}\n}
    \nvariable "APIM_RG_location" { \n type = "list"\n default = ${JSON.stringify(info['Resource Group Location*'])}\n}
    \nvariable "APIM-Name" { \n type = "list"\n default = ${JSON.stringify(info['API Management Name*'])}\n}
    \nvariable "APIMCount" { \n type = "string"\n default = "${JSON.stringify(info['API Management Name*'].length)}"\n}
    \nvariable "APIM-Location" { \n type = "list"\n default = ${JSON.stringify(info['API Management Location*'])}\n}
    \nvariable "sku" { \n type = "list"\n default = ${JSON.stringify(info['API Management SKU*'])}\n}
    \nvariable "Publisher_Name" { \n type = "list"\n default = ${JSON.stringify(info['Organization name'])}\n} //["dynapt"]
    \nvariable "Publisher_Email" { \n type = "list"\n default = ${JSON.stringify(info['Administrator email'])}\n} //["muskan.khatnani@celebaltech.com"]
    \nvariable "APIM_TagsKey-proj" { \n type = "list"\n default = ${JSON.stringify(info['Tag 1 Key'])}\n}
    \nvariable "APIM_TagsValue-proj" { \n type = "list"\n default = ${JSON.stringify(info['Tag 1 Value'])}\n}
    \nvariable "APIM_TagsKey-env" { \n type = "list"\n default = ${JSON.stringify(info['Tag 2 Key'])}\n}
    \nvariable "APIM_TagsValue-env" { \n type = "list"\n default = ${JSON.stringify(info['Tag 2 Value'])}\n}`
    stream.write(variableString)

    resolve('success')
    })
}


async function AppService_Variable (info,foldername,stream){
    return new Promise(async (resolve)=>{

        var variableString =
   `\nvariable "AppServiceWin_RG" { \n description = "Enter the Purpose for creating a resource" \n type = "list"\n default = ${JSON.stringify(info['WIN-RG Name'])}\n}
    \nvariable "AppServiceWin_RG_Location" {\n type = "list"\n default = ${JSON.stringify(info['WIN-RG Location'])}\n}
    \nvariable "Win_WebAppOS" { \n type = "list"\n default = ${JSON.stringify(info['WIN-WebApp OS'])}\n}
    \nvariable "Win_osreserved" { \n type = "list"\n default = ${JSON.stringify(info['WIN-OS Reserved'])}\n}
    \nvariable "currentStack" { \n type = "list"\n default = ${JSON.stringify(info['Current Stack'])}\n}
    \nvariable "WINwebAppNamephp" { \n description = "Enter the Purpose for creating a resource" \n type = "list"\n default = ${JSON.stringify(info['WIN-WebAppName-php'])}\n}
    \nvariable "phpVersion" { \n type = "list"\n default = ${JSON.stringify(info['Version-php'])}\n}
    \nvariable "phpappcount" { \n type = "string"\n default = "${JSON.stringify(info['php-app-count'])}"\n}
    \nvariable "WINwebAppNamePython" { \n description = "Enter the Purpose for creating a resource" \n type = "list"\n default = ${JSON.stringify(info['WIN-WebAppName-python'])}\n}
    \nvariable "pythonVersion" { \n type = "list"\n default = ${JSON.stringify(info['Version-python'])}\n}
    \nvariable "pythonappcount" { \n type = "string"\n default = "${JSON.stringify(info['python-app-count'])}"\n}

    \nvariable "AppServiceLnx_RG" { \n description = "Enter the Purpose for creating a resource" \n type = "list"\n default = ${JSON.stringify(info['LNX-RG Name'])}\n}
    \nvariable "AppServiceLnx_RG_Location" {\n type = "list"\n default = ${JSON.stringify(info['LNX-RG Location'])}\n}
    \nvariable "LnxwebAppName" { \n description = "Enter the Purpose for creating a resource" \n type = "list"\n default = ${JSON.stringify(info['LNX-WebAppName'])}\n}
    \nvariable "Lnx_AppServiceCount" { \n description = "Enter the Purpose for creating a resource" \n type = "string"\n default = "${JSON.stringify(info['LNX-appService-count'])}"\n}
    \nvariable "LNX_WebAppOS" { \n type = "list"\n default = ${JSON.stringify(info['LNX-WebApp OS'])}\n}
    \nvariable "LNX_osreserved" { \n type = "list"\n default = ${JSON.stringify(info['LNX-OS Reserved'])}\n}
    \nvariable "linuxfxversion" { \n type = "list"\n default = ${JSON.stringify(info['LinuxFxVersion'])}\n}

    \nvariable "AppService_TagsKey-proj" { \n type = "list"\n default = ${JSON.stringify(info['Tag 1 Key'])}\n}
    \nvariable "AppService_TagsValue-proj" { \n type = "list"\n default = ${JSON.stringify(info['Tag 1 Value'])}\n}
    \nvariable "AppService_TagsKey-env" { \n type = "list"\n default = ${JSON.stringify(info['Tag 2 Key'])}\n}
    \nvariable "AppService_TagsValue-env" { \n type = "list"\n default = ${JSON.stringify(info['Tag 2 Value'])}\n}`
    stream.write(variableString)

    resolve('success')
    })
}

module.exports = { blueprintCurr }