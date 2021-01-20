const excelToJson = require('convert-excel-to-json');
const fs = require('fs');
const path = require('path');

var formatted_json = {};
var columns_to_fetch_data;
var sheets = [{"sheet":"Virtual Machine (VM)", "total_rows": 34},{"sheet":"Function App", "total_rows":11},{"sheet":"Logic App", "total_rows":9},
{"sheet":"Web App and App Service", "total_rows":14},{"sheet":"APIM", "total_rows": 12}]

var sheets_to_parse = []
var json_of_sheets_to_parse = []
var excel_file;

//Convert "Function App","Logic App","APIM" sheets into JSON
function get_json() {   
    try{
        var j=0
        var total_rows;
        for(var i=0; i<sheets_to_parse.length; i++) {
            var columnKeys = {B: 'key'}
            for(var k=0; k<columns_to_fetch_data[i].length; k++) {
                columnKeys[columns_to_fetch_data[i][k]] = `value${k+1}`
            }        
            sheets.forEach(element => {
                if (element.sheet === sheets_to_parse[i]) {
                    total_rows = element.total_rows
                }
            });
            var JSON = excelToJson({
                source: fs.readFileSync(excel_file),
                sheets: [sheets_to_parse[i]],
                range: `A2:L${total_rows}`,
                columnToKey: columnKeys
            });
            json_of_sheets_to_parse.push(JSON[sheets_to_parse[i]])
        }    
    }catch(err){
        console.log('Error occured while converting Non-VM sheets of excel into JSON.')
        console.log('Error: ',err)
    }  

}

//Format the converted JSON
function format_json() {
    try{
        var i=0;
        var app_service_os;
        var current_stack;
        var tag_keys_first_value;
        var tag_keys_key;
        json_of_sheets_to_parse.forEach(json_element => {
            formatted_json[sheets_to_parse[i]]= {}
            json_element.forEach(element => {
                var key = element.key
                delete element.key
                var values = Object.values(element);
                if (sheets_to_parse[i]==="Function App" && key==='Function App OS*') {  //'Function App OS*','Kind'
                    formatted_json[sheets_to_parse[i]]['Kind'] = []
                    for(var j=0; j<values.length; j++){         //['Kind']
                        formatted_json[sheets_to_parse[i]]['Kind'].push("FunctionApp")
                    }
                    var value=[]
                    values.forEach(val => {     //['Function App OS*'] : true-> linux, false-> windows
                        if (val.toLowerCase()==='linux') {
                            value.push('true')
                        }else{
                            value.push('false')
                        }
                        formatted_json[sheets_to_parse[i]][key] = value
                    });
                }else if(sheets_to_parse[i]==="APIM" && key==='API Management SKU*'){   // include "_1" in each SKU
                    var value = []
                    values.forEach(element => {
                        value.push(element + '_1')
                    });
                    formatted_json[sheets_to_parse[i]][key] = value
                }else if(sheets_to_parse[i]==="Virtual Machine (VM)" && key==='Resource Group Name*') {
                    formatted_json[sheets_to_parse[i]][key] = values[0]
                }else if(key==='Tag 1 Key'||key==='Tag 1 Value'||key==='Tag 2 Key'||key==='Tag 2 Value'){  //Tags key-value
                    formatted_json[sheets_to_parse[i]][key]=[]
                    if (key==='Tag 1 Key' || key==='Tag 2 Key'){
                        tag_keys_key=key;
                        tag_keys_first_value= values[0]
                    }else if(key==='Tag 1 Value' || key==='Tag 2 Value'){
                        if(values.length >0) {
                            values.forEach(val=> {
                                formatted_json[sheets_to_parse[i]][tag_keys_key].push(tag_keys_first_value)
                                formatted_json[sheets_to_parse[i]][key].push(val)
                            })                          
                        }else{
                            formatted_json[sheets_to_parse[i]][tag_keys_key].push("")
                            formatted_json[sheets_to_parse[i]][key].push("")
                        }
                        tag_keys_first_value=null;
                        tag_keys_key=null;
                    }
                }else {
                    formatted_json[sheets_to_parse[i]][key] = values
                }
            });      
            i=i+1
        }); 
    }catch(err){
        console.log('Error occured while formatting the json of non-VM sheets of excel')
        console.log('Error: ',err)
    }
    
}
function get_formatted_json(file,columns_list) {  
    try{
        excel_file = path.join(__dirname, `../../../uploads/${file}`);
        columns_to_fetch_data = Object.values(columns_list)
        sheets_to_parse = Object.keys(columns_list)
        get_json();
        format_json();   
        var output_json = formatted_json
        formatted_json = {}             
        json_of_sheets_to_parse=[]     
        return output_json
    }catch(err){
        console.log('Error occurred while parsing excel of non_VM sheets')
        console.log('Error: ',err)
    }
    
}

module.exports = { get_formatted_json }