resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_template_deployment" "example" {
  name                = "acctesttemplate-03"
  resource_group_name = azurerm_resource_group.example.name
parameters = {
        #"count"="8"
        "DataFactoryName" ="${var.DataFactoryName}"
        "DataFactoryLocation" ="${var.DataFactoryLocation}"
        "StorageConnectionString" = "${var.StorageConnectionString}"
        "SQLConnectionString" ="${var.SQLConnectionString}"
        "Sources" ="${var.Sources}"
        "ServiceUri" = "${var.ServiceUri}"
	     "Dynamic365username"="${var.Dynamic365username}" 
        "Dynamic365Password" ="${var.Dynamic365Password}"
        "dynamic365Entity" ="${var.dynamic365Entity}"
      }
  template_body = <<DEPLOY

{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
      "DataFactoryName": {
        "type": "string",
        "defaultValue": " "
      },
      "DataFactoryLocation": {
        "type": "string",
         "defaultValue": " Central US",
        "allowedValues": [
          "Australia East",
          "Brazil South",
          "Canada Central",
          "Central India",
          "Central US",
          "East US",
          "East US 2",
          "France Central",
          "Japan East",
          "North Europe",
          "South Central US",
          "Southeast Asia",
          "UK South",
          "West Central US",
          "West Europe",
          "West US",
          "West US 2"
        ]
      },
      "StorageConnectionString": {
        "type": "string",
        "defaultValue": ""

      },
      "SQLConnectionString": {
        "type": "securestring"
      },
      "Sources": {
        "type": "string",
        "defaultValue": "Dynamics365"
        
      },
      "ServiceUri": {
        "type": "string",
        "defaultValue": ""
      },
      "Dynamic365username": {
        "type": "string",
        "defaultValue": ""
      },
      "Dynamic365Password": {
        "type": "string",
        "defaultValue": ""
      },
      "dynamic365Entity": {
        "type": "string"
      },
      "BlobTable":{
      "type": "array",
      "defaultValue": [
      {
      "table_name": "Account"
      },
      {
      "table_name": "Contact"
      }
      ]
      }
    },
        "variables": {
      "api-version": "2018-06-01",
      "integrationrt": "integrationRuntime1",
      "SALinkedService": "StorageAccountLS",
      "SADS": "StorageAccountDS",
      "SADSStaging": "SADSStaging",
      "SQLDBLinkedService": "SQLDBLS",
      "SQLDBDataset": "SQLDBDSSF",
      "SQLDBDateDS": "SQLDBDateDS",
      "SQLDBStagingDS": "SQLDBStagingDS",
      "SQLDBMainDS": "SQLDBMainDS",
      "Dynamic365LinkedService": "Dynamic365LS",
      "Dynamic365Dataset": "Dynamic365DS",
      "Dynamic365Pipeline": "Dynamic365Pipeline"
    },
         "resources": [
        {
          "type": "Microsoft.DataFactory/factories",
          "apiVersion": "[variables('api-version')]",
          "name": "[parameters('DataFactoryName')]",
          "location": "[parameters('DataFactoryLocation')]",
          "resources": [
            {
              "type": "linkedservices",
              "apiVersion": "[variables('api-version')]",
              "name": "[variables('SQLDBLinkedService')]",
              "dependsOn": [
                "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]"
              ],
              "properties": {
                "type": "AzureSqlDatabase",
                "typeProperties": {
                  "connectionString": {
                    "type": "SecureString",
                    "value": "[parameters('SQLConnectionString')]"
                  }
                }
              }
            },
            {
                "type": "datasets",
                "apiVersion": "[variables('api-version')]",
                "name": "[variables('SQLDBDataset')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
                  "[variables('SQLDBLinkedService')]"
                ],
                "properties": {
                  "type": "AzureSqlTable",
                  "linkedServiceName": {
                    "referenceName": "[variables('SQLDBLinkedService')]",
                    "type": "LinkedServiceReference"
                  },
                  "schema": [],
                  "parameters": {
                    "tablelist": {
                      "type": "array"
                    }
                  },
                  "typeProperties": {
                    "tableName": {
                      "value": "@dataset().tablelist",
                      "type": "Expression"
                    }
                  }
                }
              },
              {
                "type": "datasets",
                "apiVersion": "[variables('api-version')]",
                "name": "[variables('SQLDBMainDS')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
                  "[variables('SQLDBLinkedService')]"
                ],
                "properties": {
                  "type": "AzureSqlTable",
                  "linkedServiceName": {
                    "referenceName": "[variables('SQLDBLinkedService')]",
                    "type": "LinkedServiceReference"
                  },
                  "schema": [],
                  "parameters": {
                    "Main_table": {
                      "type": "string"
                    }
                  },
                  "typeProperties": {
                    "tableName": {
                      "value": "@dataset().Main_table",
                      "type": "Expression"
                    }
                  }
                }
              },
              {
                "type": "datasets",
                "apiVersion": "[variables('api-version')]",
                "name": "[variables('SQLDBDateDS')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
                  "[variables('SQLDBLinkedService')]"
                ],
                "properties": {
                  "type": "AzureSqlTable",
                  "linkedServiceName": {
                    "referenceName": "[variables('SQLDBLinkedService')]",
                    "type": "LinkedServiceReference"
                  },
                  "schema": [],
                  "parameters": {
                    "Date_Table": {
                      "type": "string"
                    }
                  },
                  "typeProperties": {
                    "tableName": {
                      "value": "@dataset().Date_Table",
                      "type": "Expression"
                    }
                  }
                }
              },
              {
                "type": "datasets",
                "apiVersion": "[variables('api-version')]",
                "name": "[variables('SQLDBStagingDS')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
                  "[variables('SQLDBLinkedService')]"
                ],
                "properties": {
                  "type": "AzureSqlTable",
                  "linkedServiceName": {
                    "referenceName": "[variables('SQLDBLinkedService')]",
                    "type": "LinkedServiceReference"
                  },
                  "schema": [],
                  "parameters": {
                    "Staging_Table": {
                      "type": "string"
                    }
                  },
                  "typeProperties": {
                    "tableName": {
                      "value": "@dataset().Staging_Table",
                      "type": "Expression"
                    }
                  }
                }
              },
              {
                "type": "linkedservices",
                "apiVersion": "[variables('api-version')]",
                "name": "[variables('SALinkedService')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]"
                ],
                "properties": {
                  "type": "AzureBlobStorage",
                  "description": "Azure Storage linked service",
                  "typeProperties": {
                    "connectionString": {
                      "type": "SecureString",
                      "value": "[parameters('StorageConnectionString')]"
                    }
                  }
                }
              },
              {
                "name": "[variables('SADS')]",
                "type": "datasets",
                "apiVersion": "[variables('api-version')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
                  "[variables('SALinkedService')]"
                ],
                "properties": {
                  "linkedServiceName": {
                    "referenceName": "[variables('SALinkedService')]",
                    "type": "LinkedServiceReference"
                  },
                  "parameters": {
                    "sinkfilename": {
                      "type": "array"
                    }
                  },
                  "annotations": [],
                  "type": "DelimitedText",
                  "typeProperties": {
                    "location": {
                      "type": "AzureBlobStorageLocation",
                      "fileName": {
                        "value": "@dataset().sinkfilename",
                        "type": "Expression"
                      },
                      "container": "marketplace"
                    },
                    "columnDelimiter": ",",
                    "escapeChar": "\\",
                    "firstRowAsHeader": true,
                    "quoteChar": "\""
                  },
                  "schema": []
                }
              },
              {
                "name": "[variables('SADSStaging')]",
                "type": "datasets",
                "apiVersion": "[variables('api-version')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
                  "[variables('SALinkedService')]"
                ],
                "properties": {
                  "linkedServiceName": {
                    "referenceName": "[variables('SALinkedService')]",
                    "type": "LinkedServiceReference"
                  },
                  "parameters": {
                    "Staging_Blob": {
                      "type": "string"
                    }
                  },
                  "annotations": [],
                  "type": "DelimitedText",
                  "typeProperties": {
                    "location": {
                      "type": "AzureBlobStorageLocation",
                      "fileName": {
                        "value": "@dataset().Staging_Blob",
                        "type": "Expression"
                      },
                      "container": "marketplace"
                    },
                    "columnDelimiter": ",",
                    "escapeChar": "\\",
                    "firstRowAsHeader": true,
                    "quoteChar": "\""
                  },
                  "schema": []
                }
              },
              {
                "condition": "[equals(parameters('Sources'),'Dynamics365')]",
                "type": "linkedservices",
                "apiVersion": "[variables('api-version')]",
                "name": "[variables('Dynamic365LinkedService')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]"
                ],
                "properties": {
                  "type": "Dynamics",
                	"typeProperties": {
						"deploymentType": "Online",
						"serviceUri": "[parameters('ServiceUri')]",
						"authenticationType": "Office365",
						"username": "[parameters('Dynamic365username')]",
						"password": {
							"type": "SecureString",
							"value": "[parameters('Dynamic365Password')]"
						}
					}
                 
                }
              },
              {
                "condition": "[equals(parameters('Sources'),'Dynamics365')]",
                "name": "[variables('Dynamic365Dataset')]",
                "type": "datasets",
                "apiVersion": "[variables('api-version')]",
                "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]",
                  "[variables('Dynamic365LinkedService')]"
                ],
                "properties": {
                  "type": "DynamicsEntity",
                  "linkedServiceName": {
                    "referenceName": "[variables('Dynamic365LinkedService')]",
                    "type": "LinkedServiceReference"
                  },
                  "typeProperties": {}
                }
              },
              {
                "condition": "[equals(parameters('Sources'),'Dynamics365')]",
                "type": "pipelines",
                "apiVersion": "[variables('api-version')]",
                "name": "[variables('Dynamic365Pipeline')]",
                "dependsOn": [
                  "[parameters('DataFactoryName')]",
                  "[variables('SALinkedService')]",
                  "[variables('SADS')]",
                  "[variables('Dynamic365LinkedService')]",
                  "[variables('Dynamic365Dataset')]",
                  "[variables('SQLDBLinkedService')]",
                  "[variables('SQLDBDataset')]"
      
                ],
                "properties": {
                  "activities": [
                    {
                      "name": "Dynamic365ForEachActivity",
                      "type": "ForEach",
                      "dependsOn": [],
                      "userProperties": [],
                      "typeProperties": {
                        "items": {
                          "value": "@pipeline().parameters.dynamic365Entity",
                          "type": "Expression"
                        },
                        "isSequential": true,
                        "activities": [
                          {
                            "name": "Dynamic365toBlob",
                            "type": "Copy",
                            "dependsOn": [],
                            "policy": {
                              "timeout": "7.00:00:00",
                              "retry": 0,
                              "retryIntervalInSeconds": 30,
                              "secureOutput": false,
                              "secureInput": false
                            },
                            "userProperties": [],
                            "typeProperties": {
                              "source": {
                                "type": "DynamicsSource",
                                "query": {
                                "value": "<fetch>\n<entity name= \"@{item().entity_name}\">\n<all-attributes />\n</entity>\n</fetch>",
                                  "type": "Expression"
                                }
                              },
                              "sink": {
                                "type": "DelimitedTextSink",
                                "storeSettings": {
                                  "type": "AzureBlobStorageWriteSetting"
                                
                                },
                                "formatSettings": {
                                  "type": "DelimitedTextWriteSetting",
                                  "quoteAllText": true,
                                  "fileExtension": ".csv"
                                }
                              },
                              "enableStaging": false
                            },
                            "inputs": [
                              {
                                "referenceName": "[variables('Dynamic365Dataset')]",
                                "type": "DatasetReference"
                              }
                            ],
                            "outputs": [
                              {
                                "referenceName": "[variables('SADS')]",
                                "type": "DatasetReference",
                                "parameters": {
                                  "sinkfilename": {
                                    "value": "@{item().entity_name}.csv",
                                    "type": "Expression"
                                  }
                                }
                              }
                            ]
                          },
                          {
                            "name": "BlobtoSQL",
                            "type": "Copy",
                            "dependsOn": [
                              {
                                "activity": "Dynamic365toBlob",
                                "dependencyConditions": [
                                  "Succeeded"
                                ]
                              }
                            ],
                            "policy": {
                              "timeout": "7.00:00:00",
                              "retry": 0,
                              "retryIntervalInSeconds": 30,
                              "secureOutput": false,
                              "secureInput": false
                            },
                            "userProperties": [],
                            "typeProperties": {
                              "source": {
                                "type": "DelimitedTextSource",
                                "storeSettings": {
                                  "type": "AzureBlobStorageReadSetting",
                                  "recursive": false,
                                  "enablePartitionDiscovery": false
                                },
                                "formatSettings": {
                                  "type": "DelimitedTextReadSetting"
                                }
                              },
                              "sink": {
                                "type": "AzureSqlSink",
                                "tableOption": "autoCreate"
                              },
                              "enableStaging": false
                            },
                            "inputs": [
                              {
                                "referenceName": "[variables('SADS')]",
                                "type": "DatasetReference",
                                "parameters": {
                                  "sinkfilename": {
                                    "value": "@{item().entity_name}.csv",
                                    "type": "Expression"
                                  }
                                }
                              }
                            ],
                            "outputs": [
                              {
                                "referenceName": "[variables('SQLDBDataset')]",
                                "type": "DatasetReference",
                                "parameters": {
                                  "tablelist": {
                                    "value": "dbo.[@{item().entity_name}]",
                                    "type": "Expression"
                                  }
                                }
                              }
                            ]
                          }
                        ]
                      }
                    }
                  ],
                  "parameters": {
                    "dynamic365entity": {
                      "type": "array",
                      "defaultValue": "[parameters('dynamic365Entity')]"
                    }
                  },
                  "annotations": []
                }
              }
          ]
               }
      ]
    }
      DEPLOY


  deployment_mode = "Incremental"
}     
