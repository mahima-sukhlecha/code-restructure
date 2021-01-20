function getBuildBody(project,organization,azurePipelineId){
    return({
        "triggers": [
            {
                "branchFilters": [
                    "+refs/heads/master"
                ],
                "pathFilters": [],
                "batchChanges": false,
                "maxConcurrentBuildsPerBranch": 1,
                "pollingInterval": 0,
                "triggerType": "continuousIntegration"
            }
        ],
        "process": {
            "phases": [
                {
                    "steps": [
                        {
                            "environment": {},
                            "enabled": true,
                            "continueOnError": false,
                            "alwaysRun": false,
                            "displayName": "Use Node version ",
                            "timeoutInMinutes": 0,
                            "condition": "succeeded()",
                            "task": {
                                "id": "31c75bbb-bcdf-4706-8d7c-4da6a1959bc2",
                                "versionSpec": "0.*",
                                "definitionType": "task"
                            },
                            "inputs": {
                                "versionSpec": "10",
                                "checkLatest": "true"
                            }
                        },
                        {
                            "environment": {},
                            "enabled": true,
                            "continueOnError": false,
                            "alwaysRun": false,
                            "displayName": "PowerShell Script",
                            "timeoutInMinutes": 0,
                            "condition": "succeeded()",
                            "task": {
                                "id": "e213ff0f-5d5c-4791-802d-52ea3e7be1f1",
                                "versionSpec": "2.*",
                                "definitionType": "task"
                            },
                            "inputs": {
                                "targetType": "inline",
                                "filePath": "",
                                "arguments": "",
                                "script": "# Fetching src folder path\n$filePath = Get-ChildItem $(Build.Repository.LocalPath) -Filter package.json -Recurse | % { $_.FullName } | Out-String\n\n# Splitting src's Parent path\n$dirPath =  Split-Path $filePath\n\n# Move to code's Base Path\ncd $dirPath\n\n# Install angular CLI\nnpm install -g @angular/cli@8.3.26\n\n# Install all node packages\nnpm install\n\n# Build code\nng build\n\n#Create a new folder named Code\nNew-Item -Path '..\\AZcodeBase' -ItemType Directory\n\n#Copy all data to Code directory\nCopy-Item -Path $dirPath\\* -Destination ..\\AZcodeBase -Force\n\nWrite-Host \"##vso[task.setvariable variable=DirPath;]$dirPath\"\n",
                                "errorActionPreference": "stop",
                                "failOnStderr": "false",
                                "ignoreLASTEXITCODE": "false",
                                "pwsh": "false",
                                "workingDirectory": ""
                            }
                        },
                        {
                            "environment": {},
                            "enabled": false,
                            "continueOnError": false,
                            "alwaysRun": false,
                            "displayName": "PowerShell Script",
                            "timeoutInMinutes": 0,
                            "condition": "succeeded()",
                            "task": {
                                "id": "e213ff0f-5d5c-4791-802d-52ea3e7be1f1",
                                "versionSpec": "2.*",
                                "definitionType": "task"
                            },
                            "inputs": {
                                "targetType": "inline",
                                "filePath": "",
                                "arguments": "",
                                "script": "ls $(System.DefaultWorkingDirectory)\\AZcodeBase\\dist",
                                "errorActionPreference": "stop",
                                "failOnStderr": "false",
                                "ignoreLASTEXITCODE": "false",
                                "pwsh": "false",
                                "workingDirectory": ""
                            }
                        },
                        {
                            "environment": {},
                            "enabled": true,
                            "continueOnError": false,
                            "alwaysRun": false,
                            "displayName": "Copy Files web.config",
                            "timeoutInMinutes": 0,
                            "condition": "succeeded()",
                            "task": {
                                "id": "5bfb729a-a7c8-4a78-a7c3-8d717bb7c13c",
                                "versionSpec": "2.*",
                                "definitionType": "task"
                            },
                            "inputs": {
                                "SourceFolder": "$(System.DefaultWorkingDirectory)",
                                "Contents": "web.config",
                                "TargetFolder": "$(System.DefaultWorkingDirectory)/out",
                                "CleanTargetFolder": "false",
                                "OverWrite": "false",
                                "flattenFolders": "false",
                                "preserveTimestamp": "false"
                            }
                        },
                        {
                            "environment": {},
                            "enabled": true,
                            "continueOnError": false,
                            "alwaysRun": false,
                            "displayName": "Archive files",
                            "timeoutInMinutes": 0,
                            "condition": "succeeded()",
                            "task": {
                                "id": "d8b84976-e99a-4b86-b885-4849694435b0",
                                "versionSpec": "2.*",
                                "definitionType": "task"
                            },
                            "inputs": {
                                "rootFolderOrFile": "$(DirPAth)\\dist",
                                "includeRootFolder": "false",
                                "archiveType": "zip",
                                "sevenZipCompression": "5",
                                "tarCompression": "gz",
                                "archiveFile": "$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip",
                                "replaceExistingArchive": "true",
                                "verbose": "false",
                                "quiet": "false"
                            }
                        },
                        {
                            "environment": {},
                            "enabled": true,
                            "continueOnError": false,
                            "alwaysRun": false,
                            "displayName": "Publish Artifact: drop",
                            "timeoutInMinutes": 0,
                            "condition": "succeeded()",
                            "task": {
                                "id": "2ff763a7-ce83-4e1f-bc89-0ae63477cebe",
                                "versionSpec": "1.*",
                                "definitionType": "task"
                            },
                            "inputs": {
                                "PathtoPublish": "$(Build.ArtifactStagingDirectory)",
                                "ArtifactName": "drop",
                                "ArtifactType": "Container",
                                "TargetPath": "",
                                "Parallel": "false",
                                "ParallelCount": "8",
                                "FileCopyOptions": ""
                            }
                        }
                    ],
                    "name": "Agent job 1",
                    "refName": "Job_1",
                    "condition": "succeeded()",
                    "target": {
                        "executionOptions": {
                            "type": 0
                        },
                        "allowScriptsAuthAccessOption": false,
                        "type": 1
                    },
                    "jobAuthorizationScope": "projectCollection"
                }
            ],
            "target": {
                "agentSpecification": {
                    "identifier": "vs2017-win2016"
                }
            },
            "type": 1
        },
        "repository": {
            "properties": {
                "cleanOptions": "0",
                "labelSources": "0",
                "labelSourcesFormat": "$(build.buildNumber)",
                "reportBuildStatus": "true",
                "gitLfsSupport": "false",
                "skipSyncSource": "false",
                "checkoutNestedSubmodules": "false",
                "fetchDepth": "0"
            },
            "type": "TfsGit",
            "name": project,
            "url": `https://dev.azure.com/${organization}/${project}/_git/${project}`,
            "defaultBranch": "refs/heads/master",
            "clean": "false",
            "checkoutSubmodules": false
        },
        "processParameters": {},
        "quality": "definition",
        "queue": {
            "_links": {
                "self": {
                    "href": `https://dev.azure.com/${organization}/_apis/build/Queues/${azurePipelineId}`
                }
            },
            "id": azurePipelineId,
            "name": "Azure Pipelines",
            "url": "",
            "pool": {
                "id": 9,
                "name": "Azure Pipelines",
                "isHosted": true
            }
        },
        "name": project+"-CI",
        "type": "build",
        "queueStatus": "enabled"
      
    })
}
module.exports = {getBuildBody}