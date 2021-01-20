const excelToJson = require('convert-excel-to-json');
const fs = require('fs');
const path = require('path');
const xlsxFile = require('read-excel-file/node');
const parse_AppService = require('./parse_AppService')
const parse_VM = require('./parse_VM')
const parse_non_VM = require('./parse_non_VM');
var excel_file;

var columns = ['C','D','E','F','G','H','I','J','K','L']
var columns_to_fetch_data = [[],[],[],[],[]];
var sheet_list = ["Virtual Machine (VM)","Function App","Logic App","Web App and App Service","APIM"]
var sheets = [{"sheet":"Virtual Machine (VM)", "total_rows": 34},{"sheet":"Web App and App Service", "total_rows":14},
{"sheet":"Function App", "total_rows":11},{"sheet":"Logic App", "total_rows":9},{"sheet":"APIM", "total_rows": 12}]



//Check the uploaded file (file format & sheet names)
async function validateExcel(file_obj) {
    try{
        return new Promise(async (resolve,reject)=>{
            if((file_obj.originalname.split(".")).pop() ==='xlsm'){     //Only "xlsm" file format allowed
                excel_file = path.join(__dirname, `../../../uploads/${file_obj.filename}`)
                xlsxFile(excel_file, { getSheets: true }).then((sheets) => {
                    var excel_sheets = sheets.filter(obj => sheet_list.includes(obj.name))
                    if(excel_sheets.length !== sheet_list.length) {     //If all 5 sheet names doesn't match
                        resolve({"status":"Please upload a valid excel file."})  //Invalid Excel File
                    } else{
                        resolve({"status":"Valid Excel"})  } //Excel contains all 5 sheets of sheets_list
                }).catch(err => {
                    reject(err)
                })
            } else{
                resolve({"status":"Please upload a valid file format."}) }   //Invalid File Format
        })
    }catch(err){        
        console.log('Error: ',err)
    }    
}

//Select all the columns whose all rows are properly filled.(Except the optional fields)
function get_columns_for_fetching_data() {
    try{
        var i=0;
        sheets.forEach(element => {        
            columns.forEach(ele => {
                var JSON = excelToJson({
                    source: fs.readFileSync(excel_file),
                    sheets: [element.sheet],
                    range: `${ele}2:${ele}${element.total_rows}`
                });              
                if (element.sheet==='Virtual Machine (VM)') {
                    if ((JSON[element.sheet]).length >26) {
                        if ((JSON[element.sheet]).length === 33) {
                            columns_to_fetch_data[i].push(ele)
                        } else {
                            var json1 = excelToJson({
                                source: fs.readFileSync(excel_file),
                                sheets: [element.sheet],
                                range: `${ele}11:${ele}14`  //Firewall Info. (Optional Fields)
                            });
                            var json2 = excelToJson({
                                source: fs.readFileSync(excel_file),
                                sheets: [element.sheet],
                                range: `${ele}31:${ele}34`  //Tags Info. (Optional Fields)
                            });
                            var firewall_fields_length = (json1[element.sheet]).length
                            var tag_fields_length = (json2[element.sheet]).length
                            var optional_fields_length = (firewall_fields_length + tag_fields_length)-2
                            if ((JSON[element.sheet]).length - optional_fields_length === element.total_rows-7) {
                                columns_to_fetch_data[i].push(ele)   
                            }
                        }
                    }
                } else {
                    var json = excelToJson({
                        source: fs.readFileSync(excel_file),
                        sheets: [element.sheet],
                        range: `${ele}${element.total_rows -3}:${ele}${element.total_rows}`
                    });
                    if ((JSON[element.sheet]).length - json[element.sheet].length === element.total_rows-5) {               
                        (columns_to_fetch_data[i]).push(ele)           
                    }  
                }            
            });
            i=i+1
        });  
        var col = columns_to_fetch_data
        columns_to_fetch_data = [[],[],[],[],[]] 
        return col
    }catch(err){
        console.log('Error occurred while getting columns for fetching data')
        console.log('Error: ',err)
    } 
}

//Parse Excel into JSON.
async function parseExcel(file_obj) {
    try{
        var response = await validateExcel(file_obj);
        if(response.status==="Please upload a valid excel file." || response.status==="Please upload a valid file format.") {
            return response
        }else{
            var list_of_columns = get_columns_for_fetching_data();

            var flag=false      
            list_of_columns.forEach(element => { //If list_of_columns= [[],[],[],[],[]] (Nothing creates) 
                if(element.length>0 && flag===false){
                    flag=true
                }
            });
            if(!flag){
                return {"status":"Please retry with filled excel file."} //Empty sheet or improper filled sheet
                
            }else{
                var sheet_columns = {}
                var VM_AppService_json_data= {};
    
                if (list_of_columns[0].length>0) {   //VM        
                    var json = parse_VM.get_formatted_json(file_obj.filename,list_of_columns[0])
                    VM_AppService_json_data["VM"]= json
                }
                if (list_of_columns[1].length>0) {   //AppService     
                    var json = parse_AppService.get_formatted_json(file_obj.filename,list_of_columns[1])
                    VM_AppService_json_data["AppService"]= json
                }
                for(var i=2; i<sheets.length; i++) {
                    if(list_of_columns[i].length>0) {       
                        sheet_columns[sheets[i].sheet]= list_of_columns[i]
                    }
                }
                //FunctionApp, LogicApp, APIM                                               
                var non_VM_AppService_json_data = parse_non_VM.get_formatted_json(file_obj.filename,sheet_columns)
                sheet_columns = {}
                
                //Merging all JSONs into a Single JSON
                var json_data = Object.assign({}, VM_AppService_json_data, non_VM_AppService_json_data);

                var no_of_resources_being_created=0;
                list_of_columns.forEach(element => {
                    if(element.length>0){
                        no_of_resources_being_created+=1
                    }
                });
                json_data.no_of_resources = no_of_resources_being_created
                return json_data
            }
        }      
    }catch(err){
        console.log('Error occurred while parsing excel with multiple sheets')
        console.log('Error: ',err)
    }    
}


module.exports = { parseExcel }

