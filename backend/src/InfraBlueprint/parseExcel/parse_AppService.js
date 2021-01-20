const excelToJson = require('convert-excel-to-json');
const fs = require('fs');
const path = require('path');
var excel_file;
var columns_to_fetch_data;
var sheet_name = 'Web App and App Service'
var total_rows = 14
var formatted_json= {}
var result;
var List = [{'index':0,'WIN':'WIN-RG Name','LNX':'LNX-RG Name'},
            {'index':1,'WIN':'WIN-RG Location','LNX':'LNX-RG Location'},
            {'index':5,'WIN':'WIN-WebApp OS','LNX':'LNX-WebApp OS'}]
var List2 = ['WIN-OS Reserved','Current Stack','WIN-WebAppName-php','WIN-WebAppName-python','Version-php',
            'Version-python','LNX-OS Reserved','LNX-WebAppName','LinuxFxVersion']
var List3 = [['WIN-WebAppName-php','php-app-count'],['WIN-WebAppName-python','python-app-count'],
                    ['LNX-WebAppName','LNX-appService-count']]

//Convert "Web App and App Service" sheet into JSON
function get_json() {
    try{
        var columnKeys = {B: 'key'}
        var i=1
        columns_to_fetch_data.forEach(key => {
            columnKeys[key] = `value${i}`
            i=i+1
        });    
        var JSON = excelToJson({
            source: fs.readFileSync(excel_file),
            sheets: [sheet_name],
            range: `A2:L${total_rows}`,
            columnToKey: columnKeys
        });
        result = JSON[sheet_name]
    }catch(err){
        console.log('Error occurred while getting JSON of VM sheet')
        console.log('Error: ',err)
    }    
}

//Seperating resources on the basis of their OS-type
function seperating_resources_for_win_and_lnx() {
    try{
        var app_service_os= result[5]  //Web App OS
        delete app_service_os.key
        var values= Object.values(app_service_os)

        List.forEach(element => {
            formatted_json[element["WIN"]] = []
            formatted_json[element["LNX"]] = []
        });
        List2.forEach(element => {
            formatted_json[element]= []
        });

        for(let i=0; i<columns_to_fetch_data.length; i++){
            if(values[i]==='Windows_Stack'){
                List.forEach(element => {
                    if(element.index===5){
                        formatted_json[element["WIN"]].push("Windows") 
                    }else{
                        formatted_json[element["WIN"]].push((result[element.index])[`value${i+1}`])
                    }
                });
                formatted_json['WIN-OS Reserved'].push('false')
                formatted_json['Current Stack'].push(result[7][`value${i+1}`])
                if(result[6][`value${i+1}`]==='php'){
                    formatted_json['WIN-WebAppName-php'].push(result[2][`value${i+1}`])
                    formatted_json['Version-php'].push(result[8][`value${i+1}`])
                }else{
                    formatted_json['WIN-WebAppName-python'].push(result[2][`value${i+1}`])
                    formatted_json['Version-python'].push(result[8][`value${i+1}`])  }
            }else{
                List.forEach(element => {
                    if(element.index===5){
                        formatted_json[element["LNX"]].push("Linux")
                    }else{
                        formatted_json[element["LNX"]].push((result[element.index])[`value${i+1}`])
                    }
                });
                formatted_json['LNX-OS Reserved'].push('true')
                formatted_json['LNX-WebAppName'].push(result[2][`value${i+1}`])
                formatted_json['LinuxFxVersion'].push(result[7][`value${i+1}`]+'|'+result[8][`value${i+1}`])
            }
        }
    }catch(err){
        console.log('Error occurred while sepearting resources for WIN and LINUX')
        console.log('Error: ',err)
    }
    
}

function format_json(){
    //Tags key-value
    var list = []
    list.push([result[9],result[10]]) //Tag1
    list.push([result[11],result[12]]) //Tag2
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
              formatted_json[tag_values_key].push(values[i]) }
        }else{
          formatted_json[tag_keys_key].push("")
          formatted_json[tag_values_key].push("") }
    });  

    
    //Count Items of AppService Variable file
    List3.forEach(element => {
        if(formatted_json[element[0]].length===0){
            formatted_json[element[1]]=0
        }else{
            formatted_json[element[1]]=formatted_json[element[0]].length }    
    });
   
    //If Win-RG not present, assign it the LNX one, and vice versa
    if(formatted_json['LNX-RG Name'].length===0){
        formatted_json['LNX-RG Name']= formatted_json['WIN-RG Name']
    }
    if(formatted_json['WIN-RG Name'].length===0){
        formatted_json['WIN-RG Name']= formatted_json['LNX-RG Name']
    }

    //If length of item is 0, then push "" in that item list.
    List.forEach(element => {
        if(formatted_json[element['WIN']].length===0){
            formatted_json[element['WIN']].push("") }
        if(formatted_json[element['LNX']].length===0){
            formatted_json[element['LNX']].push("") }
    });
    List2.forEach(element => {
        if(formatted_json[element].length===0){
            formatted_json[element].push("") }
    });
}


function get_formatted_json(file,columns) {  
    try{
        excel_file = path.join(__dirname, `../../../uploads/${file}`);
        columns_to_fetch_data = columns
        get_json();
        seperating_resources_for_win_and_lnx();
        format_json();  
        var output_json = formatted_json
        formatted_json = {}   
        return output_json
    }catch(err){
        console.log('Error occurred while parsing excel of non_VM sheets')
        console.log('Error: ',err)
    }
}

module.exports = { get_formatted_json }