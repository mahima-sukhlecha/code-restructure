var express = require('express');
var router = express.Router();

const dataETL = require('../src/DataETL/handler') // Handle all the components in Data ETL Dashboard
const etlTokens = require('../utils/ETLTokens') // Get Runtime and Storage Account Tokens
const etlAvailabilityStatus = require('../utils/ETLAvailability') //Check Availability of ETL Components



router.post('/api/fetchdata',dataETL.dataETLHandler) // Deploying ETL Components
router.post('/api/strtoken',etlTokens.storageAccountKeys) //Get Storage Account Keys
router.post('/api/runtimetoken',etlTokens.runtimeKeys) // Get Runtime Keys
router.post('/api/stravailable',etlAvailabilityStatus.storageAvailability) //Check Storage account Availabilty
router.post('/api/adfstatus',etlAvailabilityStatus.ADFExistence)//Check Storage account Availability
router.post('/api/sqlserveravailable',etlAvailabilityStatus.sqlserverAvailability) //Check SQL Server Avaialability
