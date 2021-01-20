var request = require('request');
const common = require('./common');
//const { response } = require('express');
//need to handle for all the metricanmes
exports.metricAlert = async(req,res) =>{
    try {
        Promise.all(req.query.metricnames.map(async function (eachMetricName){
            url = `https://management.azure.com/${req.query.scope}/providers/Microsoft.Insights/metrics?api-version=2018-01-01&aggregation=${req.query.aggregation}&metricnames=${eachMetricName}&interval=${req.query.interval}&timespan=${req.query.timespan}`
            response = await common.getCommon(url,req.header('Authorization'))
            if(response.value.length !== 0){
                var data = response.value[0].timeseries[0].data
                var aggr = (req.query.aggregation).toLowerCase()
                data.forEach(element => {
                    if(!element[aggr]){
                        element[aggr] = null  }
                });
            return response
            }else{
                return response
            }
            
        })).then((results)=>{
            res.send(results)
        }).catch(err=>{
            res.status(400).send(err)
        })
    } catch(error) {
        console.log(error)
        res.status(404).send({"Error":"Error in getting response"})
    }    
}
