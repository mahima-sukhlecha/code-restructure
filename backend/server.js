require('dotenv').config();
const express = require('express')
const http =  require('http')
var request = require('request');
const sql = require('mssql')
const bodyParser = require('body-parser')
var randomstring = require("randomstring");
const app = express()
const port = process.env.PORT||3000;
var cors = require('cors');
var cron = require('node-cron');
const multer = require('multer');
const newLogin = require('./admin/Login')
const credentials1 = require('./utils/Credentials')
const {get_token} = require('./utils/access_token')
const addNewUser = require('./admin/Registration')
const editAdminCred = require('./admin/AddCredentials')
const Logout = require('./admin/Logout')
const {getProfilePhoto} = require('./admin/profile/profilePhoto');
const policiesList = require('./src/AzurePolicies/AppliedPoliciesList')
const addPolicy = require('./src/AzurePolicies/Add_Policy')
const removepolicy = require('./src/AzurePolicies/Delete_Policy')
const iPaaSHandler = require('./src/iPaaS/handler')
const rgList = require('./utils/RG_List')
const telemetrystatus = require('./src/Monitoring/telemetryData')
const addRG = require("../backend/Scripts/ResourceGroup")
//Import Data ETL Files
var dataEtl = require('./Routers/DataETL')
// const dataETL = require('./src/DataETL/handler') // Handle all the components in Data ETL Dashboard
// const etlTokens = require('./utils/ETLTokens') // Get Runtime and Storage Account Tokens
// const etlAvailabilityStatus = require('./utils/ETLAvailability') //Check Availability of ETL Components
//Import DevOps Files
const devops = require('./src/DevOps/handler')
const devopsAvailabilityState = require('./utils/devOpsStatus')
//Import DevOps-Starter Files
const organization = require('./src/DevOps-Starter/Check-Organization')
const devops_starter = require('./src/DevOps-Starter/orchestration')
const endpoints = require('./src/DevOps-Starter/endpoints')
const deleteProject = require('./src/DevOps-Starter/Delete-Project')
//bot
const agents = require('./agents-bot/AgentList')
const nethandler = require('./src/Networking/handler')


const infrastructure = require('./src/Infrastructure/handler')
const FetchResources = require('./utils/GetResourcesInfo')
const ResourceList = require('./src/ResourceMonitoring/GetResourcesList')

const ValidateInput = require("./utils/validation")
//WVDI
const WVDIStatus = require('./utils/Availability-WVDI')

const costOptimization = require('./src/Cost-Optimization/PricingGraphCron')
const userList = require('./src/IAM/FetchUserList')
const userDetail = require('./src/IAM/EachUserSubs')
const removeAssignment = require('./src/IAM/DeleteRolesAssign')
const addassignment = require('./src/IAM/AddRoles')
const sqlConnect = require('./config/sqlconfig')
const assignedUrl = require('./config/assignedURL')
const notification = require('./config/sendNotification')

const metricAlerts = require('./src/ResourceMonitoring/metricAlert')
const recoveryVault = require('./src/BC&DR/RecoveryServiceVault')
const databaseBackup = require('./src/BC&DR/DatabaseBackup')
const retentionPolicies = require('./src/BC&DR/RetentionPolicies')
const vmBackup = require('./src/BC&DR/VMBackup')
const vaultList = require('./src/BC&DR/ExistingVaults')
const importBackup = require('./src/BC&DR/DatabaseImport')
const {replicationOfVM} = require('./src/BC&DR/ReplicationVM')
const listOfVM = require('./src/BC&DR/VMList')
const Moprtations = require('./src/ResourceMonitoring/monitoringOperations')
const getstate = require('./src/ResourceMonitoring/checkstate') 
const crudTags = require('./src/ResourceMonitoring/crudOpTags')
const scheduling = require('./src/ResourceMonitoring/schedulingData')

const sqlOnVMReplication = require('./src/BC&DR/VMonSQLRecovery')
const excelHandler = require('./src/InfraBlueprint/handler')

const checkvgateway = require('./src/Networking/NetworkingComponents') //Networking Components Files
const getVnetstate = require('./utils/VnetStatus') //check availabilty of networking components
const infraCheckAvailability = require('./src/Infrastructure/Scripts/ComponentStorage')
const ipaasCheckAvailability = require('./utils/InfraAvailability')

// const user = require('./src/Project-Insights/user')
// const project = require('./src/Project-Insights/project');
// const resource = require('./src/Project-Insights/resource')
var projectInsights = require('./Routers/ProjectInsights')
const {checkUser} = require('./utils/checkUser')

const roleAssignment = require('./src/Auditing & Logs/roleAssignment')

const tokenPowerBI = require('./Routes/index');
const currency = require('./Routes/currencyCron')

const build = require('./src/DevOps-Starter/Release-Pipeline')

app.use(cors());
// parse requests of content-type - application/json
app.use(bodyParser.json())
const config = {
    user: process.env.user,
    password: process.env.password,
    server: process.env.server,
    database: process.env.database,
    encrypt: true,
    requestTimeout: 1500000
};

app.post('/api/build',build.releasePipeline)
// Login to A3S Portal
app.get('/api/validate-id',newLogin.getCredentialsFromDatabase) //Get tid and appid  based on A3SId
app.get('/api/Resources-list',newLogin.getAllResourcesAtLogin) // Get the list of Subscription and their RGs after Login

//app.post('/api/netComponents',nethandler.networkingOrchestration)
// app.put('/sample-get-api',(req,res)=>{
//     console.log(req.query)//{ id: '1234', value: 'mahima' }
//     //console.log(req.params)// scope: 'abcdefgh' }
//     res.send('success')
// })



app.post('/api/iPaaS',iPaaSHandler.integrationHandler)

// Get Bearer Token
app.get('/api/accesstoken',(req,res)=>{
    get_token(function(err,data){
        res.send(data)
    })
})

// //Routes
// app.get('/api/exchangeRates',currency.exchangeRates)


//Bot- get agentlist
app.get('/api/agents-List',agents.getAgentList)

//Admin 
app.post('/api/registration',addNewUser.registration)
app.post('/api/test-credentials',editAdminCred.testCredentials)
app.post('/api/update-credentials',editAdminCred.updateCredentials)
app.delete('/api/logout',Logout.logout)

//Profile
app.get('/api/getProfilePhoto',getProfilePhoto)
app.get('/api/getUserInfo',userList.getUserInfoFromEmail)

//Data ETL
app.use('/api/dataEtl',dataEtl)
// app.post('/api/fetchdata',dataETL.dataETLHandler) // Deploying ETL Components
// app.post('/api/strtoken',etlTokens.storageAccountKeys) //Get Storage Account Keys
// app.post('/api/runtimetoken',etlTokens.runtimeKeys) // Get Runtime Keys
// app.post('/api/stravailable',etlAvailabilityStatus.storageAvailability) //Check Storage account Availabilty
// app.post('/api/adfstatus',etlAvailabilityStatus.ADFExistence)//Check Storage account Availability
// app.post('/api/sqlserveravailable',etlAvailabilityStatus.sqlserverAvailability) //Check SQL Server Avaialability

//Networking Components
app.post('/api/network-components',nethandler.networkingHandler) // Deploying Networking components
app.post('/api/vnet-status',getVnetstate.vnetAvailability) // Check the virtual network name availability
app.post('/api/firewall-status',getVnetstate.firewallAvailability)// Check the virtual network name availability
app.post('/api/vnetpeering-status',getVnetstate.vnetPeeringAvailability)// Check the virtual network Peering name availability
app.post('/api/ipaddr-status',getVnetstate.publicIPAvailability)// Check the PublicIP name availability
app.post('/api/gateway-status',getVnetstate.gatewayAvailability)// Check the virtual network gateway name availability
app.post('/api/expressRoute-status',getVnetstate.expressRouteAvailability)// Check the Express Route availability
app.post('/api/s2s-status',getVnetstate.sitetositeAvailability)// Check the s2s connection name availability
app.post('/api/checkNetComponents',checkvgateway.checkVNetGatewayAvailability) //Checking availability of S2S and P2S and make Connection in S2S if Virtual Network Gateway is up
//app.post('/api/checkFirewallStatus',checkvgateway.firewallAudit)

//Devops
app.post('/api/devops-automation',devops.devOpsHandler) // Deploying DevOps Components
app.post('/api/AKS-status',devopsAvailabilityState.AKSAvailability) //Check AKS Availability 
app.post('/api/ACR-status',devopsAvailabilityState.containerRegistryAvailability)//Check ACR Availability 
app.post('/api/ASF-status',devopsAvailabilityState.serviceFabricAvailability)//Check ASF Availability 

//DevOps-Starter
app.post('/api/validateOrganization',organization.validateOrganizationName) //check organization in DB
app.post('/api/orchestration',devops_starter.orchestration)   
app.get('/api/getStatus',endpoints.getProjectStatusFromDatabase)  //get status from DB in every 30 sec
app.get('/api/getDevOpsProject',endpoints.getProjectsListFromDatabase) //get projects list from DB
app.post('/api/deleteDevOpsProject',deleteProject.deleteProject)

//PowerBI
app.post('/api/token-PowerBI',tokenPowerBI.getTokenForPowerBI) //Get PowerBI Embedded Token


// Infrastructure
app.post('/api/infra-deployment',infrastructure.networkingInfraHandler)
app.post('/api/cosmosAvailability',infraCheckAvailability.checkCosmosAvailabaility)
app.post('/api/elasticPoolAvailability',infraCheckAvailability.checkElasticPoolAvailabaility)
app.post('/api/ApimAvailability',ipaasCheckAvailability.APIMAvailability)
app.post('/api/siteAvailability',ipaasCheckAvailability.sitesAvailability)
app.post('/api/sitesNameAvailabilty',ipaasCheckAvailability.sitesNameAvailability)
app.post('/api/logicappAvailability',ipaasCheckAvailability.logicAppAvailability)
app.post('/api/getVnet',WVDIStatus.listOfExistingVnet) // WVDI
app.post('/api/workspace',WVDIStatus.getWorkspaceAvailability)//WVDI


//ResourceMonitoring
app.get('/api/metric-alerts',metricAlerts.metricAlert)
app.post('/api/resource-list',ResourceList.fetchResourcesList)//get resources under a subscription
app.post('/api/getstatestatus',getstate.GetStateStatus)
app.post('/api/Monitoring',Moprtations.operate)
app.post('/api/crud-tags',crudTags.crudOperationOnTags)
app.post('/api/applying-schedules',scheduling.insertAppliedSchedules)//add applied schedules in DB
app.post('/api/global-schedules',scheduling.insertGlobalSchedules)//add global schedules in DB
app.get('/api/getSchedulingData',scheduling.fetchData)
//app.put('/api/updateData/:key',scheduling.updateData)
app.delete('/api/deleteData/scheduleName/:scheduleName',scheduling.deleteSchedules)//delete schedule from DB 

//Create new RG
app.post('/api/createRG',async(req,res)=>{
    await addRG.resourceGroupOrchestration(req).then((results)=>{
        res.send(results)
    }).catch(err=>{
        res.status(400).send(err)
    })
    
})

//Azure Policy
app.post('/api/RGList',rgList.resourceGroupList) //Resource Group in a particular Subscription
app.post('/api/addPolicy',addPolicy.applyPolicy)//Add policy  
app.delete('/api/delete-policy/:policyAssignmentName',removepolicy.deletePolicy)//Delete policy
app.post('/api/appliedPolicyList',policiesList.subscriptionList)//Applied policy list on a subscription

// *****Monitoring
app.post('/api/status',telemetrystatus.main)
//************* */
app.post('/api/checkForTerm',ValidateInput.validation)
app.post('/api/resources',FetchResources.fetchResources)// Get resources in a RG
//IAM
app.get('/api/iam-userslist',userList.usersList)
app.get('/api/iam-filteredUsers',userList.filterdUsersList)
app.post('/api/iam-eachuser',userDetail.forEachUser)
app.delete('/api/iam-removeassignment/:roleAssignmentName',removeAssignment.deleteRoleAssignment)
app.post('/api/iam-addassignment',addassignment.addRoleAssignment)
app.post('/api/requestfromDB',sqlConnect.Getsqlresponse)

app.post('/api/addURL',assignedUrl.insertAssignedURLIntoDatabase)
app.post('/api/deleteURL',assignedUrl.deleteAssignedURLFromDatabase)
app.get('/api/getURL',assignedUrl.fetchAssignedURLFromDatabase)
app.post('/api/sendNotification',notification.SendNotification)

// //Project-Insights
app.use('/api/projectInsights',projectInsights)
// app.post('/api/addUser',user.addUser)
// app.post('/api/deleteUser',user.deleteUser)
// app.get('/api/getUser',user.getUser)
// app.post('/api/addProject',project.addProject)
// app.post('/api/deleteProject',project.deleteProject)
// app.get('/api/getProject',project.getProject)
// app.post('/api/addProjectUser',project.addProjectIntoDatabase)
// app.post('/api/addResource',resource.addResource)
// app.post('/api/deleteResource',resource.deleteResource)
// app.post('/api/addResourceUser',resource.addResourceIntoDatabase)
//utils
app.get('/api/checkUser',checkUser)

//BC&DR
app.post('/api/recovery-vault',recoveryVault.vaultOrchestration)
app.post('/api/db-backup',databaseBackup.dbBackupOrchestration)
app.post('/api/retention-policies',retentionPolicies.retentionPoliciesOrchestration)
app.post('/api/vm-backup',vmBackup.virtualMachineListOrchestration)
app.post('/api/existing-vaultlist',vaultList.existingVaultsList)
app.post('/api/enable-backup',vmBackup.enableVMBackup)
app.post('/api/import-dbBackup',importBackup.databaseBackupOrchestration)
app.post('/api/vm-list',listOfVM.vmListOrchestration)
app.post('/api/replicate-VM',async (req,res)=>{
    const cred = await credentials1.getcredentials(req.header('id'))
    if(req.body.vmDataDisk){
        const Output = await replicationOfVM(req.body,cred,'ReplicateVMMultiple'+randomstring.generate(7))
        res.send(Output)

    }else{
        const Output = await replicationOfVM(req.body,cred,'ReplicateVM'+randomstring.generate(7))
        res.send(Output)
    }
    
})
app.post('/api/sqlonvm-Recovery',async(req,res)=>{
    const cred = await credentials1.getcredentials(req.header('id'))
    const Output = await sqlOnVMReplication.createRecoveryFile(req.body,cred)
    res.send(Output)
})
app.post('/api/sqlonvm-status',sqlOnVMReplication.checkstatus)


//InfraBlueprint
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })   
var upload = multer({ storage: storage })
app.post('/api/access-excel', upload.single('file'), (req, res, next) => {
  const file = req.file
  const subscriptionId =req.header('subscriptionid')
  if (!file) {
    res.status(400).send({"Error":"Please upload a file."})
  }else{
    excelHandler.parseExcel(req,res,file,subscriptionId);
  }
})

//Auditing & Logs
app.get('/api/getRoleAssignments/:subscriptionId',roleAssignment.listRoleAssignment)


//Database connection
sql.connect(config, err => {
    if (err) {
      console.log('Failed to open a SQL Database connection.', err.stack);
    }
    
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}!`)})
    
  });
  
sql.on('error', err => console.log(err.stack));

















