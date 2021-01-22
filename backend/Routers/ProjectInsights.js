var express = require('express');
var router = express.Router();

const user = require('../src/Project-Insights/user')
const project = require('../src/Project-Insights/project');
const resource = require('../src/Project-Insights/resource')

//Project-Insights
router.post('/api/addUser',user.addUser)
router.post('/api/deleteUser',user.deleteUser)
router.get('/api/getUser',user.getUser)
router.post('/api/addProject',project.addProject)
router.post('/api/deleteProject',project.deleteProject)
router.get('/api/getProject',project.getProject)
router.post('/api/addProjectUser',project.addProjectIntoDatabase)
router.post('/api/addResource',resource.addResource)
router.post('/api/deleteResource',resource.deleteResource)
router.post('/api/addResourceUser',resource.addResourceIntoDatabase)