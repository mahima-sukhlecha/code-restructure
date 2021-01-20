require('dotenv').config();
var sql = require("mssql");
var format = require('pg-format');
const { exchangeRates } = require('exchange-rates-api');

//Truncate the table everytime before re-inserting the currency & values into database. 
async function truncateTable(){
    try {
        return new Promise((resolve,reject)=>{
            var request = new sql.Request();
            var query = `TRUNCATE TABLE [dbo].[exchangeRates]`
            request.query(query, async function (err, recordset) {
                if(err) {
                    reject({"status":err})
                }else{   
                    resolve(recordset.recordset)  }
            })
        })
    }catch(error) {
        console.log(error)
        reject({"status": "Error occurred..!!! Please try again."})
    }  
}

//Get currency & their values.
async function getExchangeRatesData() {
    return new Promise(async (resolve,reject)=>{
    try{
        var exchange_rate_data= []
        
            var result = await exchangeRates().latest().base('INR').fetch();   
            var keys= Object.keys(result)
            var values = Object.values(result)
            for(let i=0; i<keys.length; i++){
                exchange_rate_data.push([keys[i],values[i]])   }

            resolve(exchange_rate_data)
        
    }catch(error) {
        console.log(error)
        reject({"status": "Error occurred..!!! Please try again."})
    }	
})
}

//Insert Currency & their values into database.
async function insertExchangRatesIntoDatabase(exchangeRatesData){
    try {
        return new Promise((resolve,reject)=>{
            var request = new sql.Request();
            for(let i=0;i< exchangeRatesData.length;i+=1000){
                query = format(process.env.insertQueryExchangeRates,exchangeRatesData.slice(i,i+1000));
                request.query(query, async function (err, recordset){
                    if(err){
                        reject({"Error":err})
                    }else {
                        resolve({"status":"Data successfully inserted..!!!"})        }
                })
            }            
        })
    }catch(error) {
        console.log(error)
        reject({"status": "Error occurred..!!! Please try again."})
    }  
}


exports.exchangeRates = async(req,res)=> {
    try {
        await truncateTable();
        await getExchangeRatesData().then(async data=>{
            await insertExchangRatesIntoDatabase(data).then(response=>{
                console.log(response)
            }).catch(error=>{
                console.log(error)
                //res.status(400).send(error)
            })
        })
    }catch(error) {
        console.log({"status": "Error occurred..!!! Please try again."})
        //res.status(404).send({"status": "Error occurred..!!! Please try again."})
    }  
}