var cron = require('node-cron');
require('dotenv').config();
const forecastRG = require('./ForecastforRGs')
const pricing= require('./PricingForSubscription')
const forecastSubs = require('./ForecastforSubscription')

var format = require('pg-format');
 
//0-23/1
cron.schedule("00 0-23/1 * * *", forecastSubs.forecastData)
cron.schedule("02 0-23/1 * * *", forecastRG.forecastData)
cron.schedule("04 0-23/1 * * *", pricing.pricingData) //Cron for get pricing of resources under a subscription
