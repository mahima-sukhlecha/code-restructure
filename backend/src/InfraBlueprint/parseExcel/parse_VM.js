const excelToJson = require('convert-excel-to-json');
const fs = require('fs');
const path = require('path');

var List = [
    {'index':2,'WIN':'WIN-VNet Name','LNX':'LNX-VNet Name'},
    {'index':6,'WIN':'WIN-Subnet Name','LNX':'LNX-Subnet Name'},
    {'index':14,'WIN':'WIN-VM Name','LNX':'LNX-VM Name'},
    {'index':16,'WIN':'WIN-VM Size','LNX':'LNX-VM Size'},
    {'index':23,'WIN':'WIN-VM Publisher','LNX':'LNX-VM Publisher'},
    {'index':24,'WIN':'WIN-VM Offer','LNX':'LNX-VM Offer'},
    {'index':25,'WIN':'WIN-VM SKU','LNX':'LNX-VM SKU'},
    {'index':26,'WIN':'WIN-Computer Name','LNX':'LNX-Computer Name'},
    {'index':27,'WIN':'WIN-Username','LNX':'LNX-Username'},
    {'index':28,'WIN':'WIN-Password','LNX':'LNX-Password'}]

var formatted_json = {};
var sheet_name = 'Virtual Machine (VM)'
var columns_to_fetch_data;
var result;
var no_of_VMs_to_be_created;
var excel_file;


//Convert "Virtual Machine (VM)" sheet into JSON
function get_json() {
    try{
        no_of_VMs_to_be_created = columns_to_fetch_data.length
        var columnKeys = {B: 'key'}
        var i=1
        columns_to_fetch_data.forEach(key => {
            columnKeys[key] = `value${i}`
            i=i+1
        });    
        var JSON = excelToJson({
            source: fs.readFileSync(excel_file),
            header:{ rows: 1 },
            sheets: [sheet_name],
            range: 'A1:L34',
            columnToKey: columnKeys
        });
        result = JSON[sheet_name]
    }catch(err){
        console.log('Error occurred while getting JSON of VM sheet')
        console.log('Error: ',err)
    }    
}

//Take first RGName and RGLocation
function insert_rgName_and_Location_into_json() {
    try{
        var location_for_all_VMs=[];
        for (let i=0; i<no_of_VMs_to_be_created; i++) {
            location_for_all_VMs.push(result[1].value1)
        }
        formatted_json[result[0].key] = result[0].value1       //Resource Group Name
        formatted_json[result[1].key] = result[1].value1       //Resource Group Location
        formatted_json[result[3].key] = location_for_all_VMs   //Virtual Network Location
        formatted_json[result[15].key] = location_for_all_VMs  //Virtual Machine Location

    }catch(err){
        console.log('Error occurred while inserting RG-Name and RG-Location in VM-Excel')
        console.log('Error: ',err)
    }
    
}

//Format Address Space (VNet,Subnet,Firewall)
function get_address_space() {
    try{
        //Virtual Network Address Space, Subnet Address Space  
        var list = [];
        list.push([result[4],result[5],'Virtual Network Address Space']);
        list.push([result[7],result[8],'Subnet Address Space']);
        list.forEach(element => {
            delete element[0].key
            delete element[1].key
            var values = [];
            for (let i=0; i<no_of_VMs_to_be_created; i++) {
                values.push(element[0][`value${i+1}`] + '/' + element[1][`value${i+1}`])
            }
            formatted_json[element[2]] = values //VNet,Subnet                                       
        }); 
        //Firewall Subnet Address Space
        var subnet_ip_addresses = result[11]
        delete subnet_ip_addresses.key
        var subnet_ip_addresses_cidr =  result[12]
        delete subnet_ip_addresses_cidr.key
        var values2 = []
        for (let i=0; i<no_of_VMs_to_be_created; i++) {
            if (subnet_ip_addresses[`value${i+1}`] && subnet_ip_addresses_cidr[`value${i+1}`]) {
                values2.push(subnet_ip_addresses[`value${i+1}`] + '/' + subnet_ip_addresses_cidr[`value${i+1}`]) }
        }
        var unique_firewall_subnet_address_space = []
        values2.forEach(element => {
            if(!unique_firewall_subnet_address_space.includes(element)) {
                unique_firewall_subnet_address_space.push(element)
            }
        });
        formatted_json['Firewall Subnet Address Space'] = unique_firewall_subnet_address_space //Firewall

    }catch(err){
        console.log('Error occurred while getting Address Space')
        console.log('Error: ',err)
    }
    
}

//Seperating resources on the basis of availability set
function seperating_resources_for_win_and_lnx() {
    try{
        List.forEach(element => {
            formatted_json[element["WIN"]] = []
            formatted_json[element["LNX"]] = []
        });
        formatted_json['Virtual Machine Location for Win']=[]
    
        for (let i=0; i<no_of_VMs_to_be_created; i++) {
            if ((result[23][`value${i+1}`]).includes('MicrosoftWindows')) {
                List.forEach(element => {
                    formatted_json[element["WIN"]].push((result[element.index])[`value${i+1}`])
                });
                formatted_json['Virtual Machine Location for Win'].push(result[15][`value${i+1}`])
            } else {
                List.forEach(element => {
                    formatted_json[element["LNX"]].push((result[element.index])[`value${i+1}`])
                });
            }
        }
    }catch(err){
        console.log('Error occurred while sepearting resources for WIN and LINUX')
        console.log('Error: ',err)
    }
    
}

function formatting_json_for_remanining_fields() {
    try{
        var row_number = [2,6,10,13,14,17,18,19,20,21,22]
        row_number.forEach(num => {
            var data = result[num]
            var key = data.key
            delete data.key
            var values = Object.values(data);
            values = values.filter( function( val ) {
                return val !== '';
            }); 
            formatted_json[key] = values
        });
    
        // Azure Firewall Vnet
       var firewallName_data = result[9]
       delete firewallName_data.key
       var unique_firewallName_data = []
       var indexes = []
       for(let i=1; i<no_of_VMs_to_be_created+1; i++){
           if(firewallName_data[`value${i}`] && (!unique_firewallName_data.includes(firewallName_data[`value${i}`]))) {
               unique_firewallName_data.push(firewallName_data[`value${i}`])
               indexes.push(`value${i}`)
           }
       }
      formatted_json['Azure Firewall Vnet'] = []
      indexes.forEach(index => {
          formatted_json['Azure Firewall Vnet'].push(result[2][index])
      });
      formatted_json['Firewall Name*'] = unique_firewallName_data

      //Tags key-value
      var list = []
      list.push([result[29],result[30]]) //Tag1
      list.push([result[31],result[32]]) //Tag2
      list.forEach(element => {
          var tag_keys_key= element[0].key 
          delete element[0].key
          var tag_values_key= element[1].key
          delete element[1].key
          formatted_json[tag_keys_key]=[]    //Tag 1 Key or Tag 2 Key
          formatted_json[tag_values_key]=[]  //Tag 1 Value or Tag 2 Value
          var values= Object.values(element[1])
          if(values.length >0) {
            for(var i=0; i<values.length; i++){
                formatted_json[tag_keys_key].push((Object.values(element[0]))[0])
                formatted_json[tag_values_key].push(values[i])
            }
          }else{
            formatted_json[tag_keys_key].push("")
            formatted_json[tag_values_key].push("")
          }
      });   

      //If any value is [] then replace [] --by--> [""]
      List.forEach(ele => {
        if(formatted_json[ele["WIN"]].length===0){
             formatted_json[ele["WIN"]].push("")
        }
        if(formatted_json[ele["LNX"]].length===0){
         formatted_json[ele["LNX"]].push("")
    }
    });


    }catch(err){
        console.log('Error occurred while formatting json for VM sheet remaining fields')
        console.log('Error: ',err)
    }

}
function get_formatted_json(file,columns) {
    try{
        excel_file = path.join(__dirname, `../../../uploads/${file}`);
        columns_to_fetch_data = columns
        get_json();
        insert_rgName_and_Location_into_json();
        get_address_space();
        seperating_resources_for_win_and_lnx();
        formatting_json_for_remanining_fields();
        columns_to_fetch_data = []
        return formatted_json
    }catch(err){
        console.log('Error occurred while formatting JSON of VM sheet.')
        console.log('Error: ',err)
    }
}

    
module.exports = { get_formatted_json }
