var cron = require('node-cron');
require('dotenv').config();
const exchangeRates = require('./exchangeRates')

cron.schedule("0 2 * * *", exchangeRates.exchangeRates)// Run Cron everyday in morning 7AM IST