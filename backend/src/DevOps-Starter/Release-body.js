function getReleaseBody(displayName,url,id,uniqueName,avatar_href,descriptor,buildname,projectId,projectName,definationId,queueId,connectionServiceName,webAppName){
    return({
        "source": "userInterface",
        "description": null,
        "isDeleted": false,
        "variables": {},
        "variableGroups": [],
        "environments": [
            {
                "name": "prod",
                "owner": {
                    "displayName": displayName,
                    "url": url,
                    "_links": {
                        "avatar": {
                            "href": avatar_href
                        }
                    },
                    "id": id,
                    "uniqueName": uniqueName,
                    "imageUrl": avatar_href,
                    "descriptor": descriptor
                },
                "variables": {},
                "variableGroups": [],
                "preDeployApprovals": {
                    "approvals": [
                        {
                            "rank": 1,
                            "isAutomated": true,
                            "isNotificationOn": false
                    
                        }
                    ],
                    "approvalOptions": {
                        "requiredApproverCount": null,
                        "releaseCreatorCanBeApprover": false,
                        "autoTriggeredAndPreviousEnvironmentApprovedCanBeSkipped": false,
                        "enforceIdentityRevalidation": false,
                        "timeoutInMinutes": 0,
                        "executionOrder": "beforeGates"
                    }
                },
                "postDeployApprovals": {
                    "approvals": [
                        {
                            "rank": 1,
                            "isAutomated": true,
                            "isNotificationOn": false
                        } 
                    ],
                    "approvalOptions": {
                        "requiredApproverCount": null,
                        "releaseCreatorCanBeApprover": false,
                        "autoTriggeredAndPreviousEnvironmentApprovedCanBeSkipped": false,
                        "enforceIdentityRevalidation": false,
                        "timeoutInMinutes": 0,
                        "executionOrder": "afterSuccessfulGates"
                    }
                },
                "deployPhases": [
                    {
                        "deploymentInput": {
                            "parallelExecution": {
                                "parallelExecutionType": "none"
                            },
                            "agentSpecification": {
                                "identifier": "vs2017-win2016"
                            },
                            "skipArtifactsDownload": false,
                            "artifactsDownloadInput": {
                                "downloadInputs": []
                            },
                            "queueId": queueId,
                            "demands": [],
                            "enableAccessToken": false,
                            "timeoutInMinutes": 0,
                            "jobCancelTimeoutInMinutes": 1,
                            "condition": "succeeded()",
                            "overrideInputs": {}
                        },
                        "rank": 1,
                        "phaseType": "agentBasedDeployment",
                        "name": "Run on agent",
                        "refName": null,
                        "workflowTasks": [
                            {
                                "environment": {},
                                "taskId": "497d490f-eea7-4f2b-ab94-48d9c1acdcb1",
                                "version": "4.*",
                                "name": "Deploy Azure App Service",
                                "refName": "",
                                "enabled": true,
                                "alwaysRun": false,
                                "continueOnError": false,
                                "timeoutInMinutes": 0,
                                "definitionType": null,
                                "overrideInputs": {},
                                "condition": "succeeded()",
                                "inputs": {
                                    "ConnectionType": "AzureRM",
                                    "ConnectedServiceName": connectionServiceName,
                                    "PublishProfilePath": "$(System.DefaultWorkingDirectory)/**/*.pubxml",
                                    "PublishProfilePassword": "",
                                    "WebAppKind": "webApp",
                                    "WebAppName": webAppName,
                                    "DeployToSlotOrASEFlag": "false",
                                    "ResourceGroupName": "",
                                    "SlotName": "production",
                                    "DockerImageTag": "$(Build.BuildId)",
                                    "VirtualApplication": "",
                                    "Package": "$(System.DefaultWorkingDirectory)/**/*.zip",
                                    "RuntimeStack": "",
                                    "RuntimeStackFunction": "",
                                    "StartupCommand": "$(Parameters.StartupCommand)",
                                    "ScriptType": "",
                                    "InlineScript": "",
                                    "ScriptPath": "",
                                    "WebConfigParameters": "",
                                    "AppSettings": "",
                                    "ConfigurationSettings": "",
                                    "UseWebDeploy": "false",
                                    "DeploymentType": "webDeploy",
                                    "TakeAppOfflineFlag": "true",
                                    "SetParametersFile": "",
                                    "RemoveAdditionalFilesFlag": "false",
                                    "ExcludeFilesFromAppDataFlag": "false",
                                    "AdditionalArguments": "",
                                    "RenameFilesFlag": "true",
                                    "XmlTransformation": "false",
                                    "XmlVariableSubstitution": "false",
                                    "JSONFiles": ""
                                }
                            }
                        ]
                    }
                ],
                "environmentOptions": {
                    "emailNotificationType": "OnlyOnFailure",
                    "emailRecipients": "release.environment.owner;release.creator",
                    "skipArtifactsDownload": false,
                    "timeoutInMinutes": 0,
                    "enableAccessToken": false,
                    "publishDeploymentStatus": true,
                    "badgeEnabled": false,
                    "autoLinkWorkItems": false,
                    "pullRequestDeploymentEnabled": false
                },
                "demands": [],
                "conditions": [
                    {
                        "name": "ReleaseStarted",
                        "conditionType": "event",
                        "value": ""
                    }
                ],
                "executionPolicy": {
                    "concurrencyCount": 1,
                    "queueDepthCount": 0
                },
                "schedules": [],
                "retentionPolicy": {
                    "daysToKeep": 30,
                    "releasesToKeep": 3,
                    "retainBuild": true
                },
                "processParameters": {},
                "properties": {
                    "BoardsEnvironmentType": {
                        "$type": "System.String",
                        "$value": "unmapped"
                    },
                    "LinkBoardsWorkItems": {
                        "$type": "System.String",
                        "$value": "False"
                    }
                },
                "preDeploymentGates": {
                    "id": 0,
                    "gatesOptions": null,
                    "gates": []
                },
                "postDeploymentGates": {
                    "id": 0,
                    "gatesOptions": null,
                    "gates": []
                },
                "environmentTriggers": []
            }
        ],
        "artifacts": [
            {
                "type": "Build",
                "alias": "_"+buildname,
                "definitionReference": {
                    "artifactSourceDefinitionUrl": {
                        "name": ""
                    },
                    "defaultVersionBranch": {
                        "id": "",
                        "name": ""
                    },
                    "defaultVersionSpecific": {
                        "id": "",
                        "name": ""
                    },
                    "defaultVersionTags": {
                        "id": "",
                        "name": ""
                    },
                    "defaultVersionType": {
                        "id": "latestType",
                        "name": "Latest"
                    },
                    "definition": {
                        "id": definationId,
                        "name": buildname
                    },
                    "definitions": {
                        "id": "",
                        "name": ""
                    },
                    "IsMultiDefinitionType": {
                        "id": "False",
                        "name": "False"
                    },
                    "project": {
                        "id": projectId,
                        "name": projectName
                    },
                    "repository": {
                        "id": "",
                        "name": ""
                    }
                },
                "isPrimary": true,
                "isRetained": false
            }
        ],
            "triggers": [
            {
                "artifactAlias": "_"+buildname,
                "triggerConditions": [],
                "triggerType": "artifactSource"
            }
        ],
        "releaseNameFormat": "Release-$(rev:r)",
        "tags": [],
        "properties": {
            "DefinitionCreationSource": {
                "$type": "System.String",
                "$value": "ReleaseImport"
            },
            "IntegrateBoardsWorkItems": {
                "$type": "System.String",
                "$value": "False"
            },
            "IntegrateJiraWorkItems": {
                "$type": "System.String",
                "$value": "false"
            }
        },
        "name": projectName+"-CD"
    }
    )
}

module.exports = {getReleaseBody}