resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_template_deployment" "example" {
  name                = "acctesttemplate1"
  resource_group_name = azurerm_resource_group.example.name
parameters = {
        
        "VirtualNetwork-Name" ="${var.VirtualNetwork-Name}"
        "VirtualNetwork-AddressSapce" ="${var.VirtualNetwork-AddressSapce}"
        "Subnet-Name" = "${var.Subnet-Name}"
		"Subnet-AdressSpace-default" = "${var.Subnet-AdressSpace-default}"
        "clusterName" ="${var.clusterName}"
        "clusterloaction" ="${var.clusterloaction}"
        "adminUsername" = "${var.adminUsername}"
        "adminPassword" ="${var.adminPassword}"
        "vmImageOffer" = "${var.vmImageOffer}"
        "vmImageSku" ="${var.vmImageSku}"
        "certificateThumbprint" ="${var.certificateThumbprint}"
        "KeyVaultResourceId" = "${var.KeyVaultResourceId}"
        "certificateUrlValue" ="${var.certificateUrlValue}"
        "ntInstanceCount" = "${var.ntInstanceCount}"
        "nodeTypeSize" = "${var.nodeTypeSize}"
        "durabilityLevel" ="${var.durabilityLevel}"
       
      }
      
  template_body = <<DEPLOY
{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "clusterloaction": {
            "type": "string",
            "defaultValue": "East US",
            "metadata": {
                "description": "clusterloaction of the Cluster"
            }
        },
        "clusterName": {
            "type": "string",
            "metadata": {
                "description": "Name of your cluster - Between 3 and 23 characters. Letters and numbers only"
            }
        },
        "adminUsername": {
            "type": "string",
            "metadata": {
                "description": "Remote desktop user Id"
            }
        },
        "adminPassword": {
            "type": "securestring",
            "metadata": {
                "description": "Remote desktop user password. Must be a strong password"
            }
        },
        "vmImagePublisher": {
            "type": "string",
            "defaultValue": "MicrosoftWindowsServer",
            "metadata": {
                "description": "VM image Publisher"
            }
        },
        "vmImageOffer": {
            "type": "string",
            "defaultValue": "WindowsServer",
            "metadata": {
                "description": "VM image offer"
            }
        },
        "vmImageSku": {
            "type": "string",
            "defaultValue": "2016-Datacenter",
            "metadata": {
                "description": "VM image SKU"
            }
        },
        "vmImageVersion": {
            "type": "string",
            "defaultValue": "latest",
            "metadata": {
                "description": "VM image version"
            }
        },
        "loadBalancedAppPort1": {
            "type": "string",
            "defaultValue": "80",
            "metadata": {
                "description": "Input endpoint1 for the application to use. Replace it with what your application uses"
            }
        },
        "loadBalancedAppPort2": {
            "type": "string",
            "defaultValue": "8081",
            "metadata": {
                "description": "Input endpoint2 for the application to use. Replace it with what your application uses"
            }
        },
        "certificateStoreValue": {
            "type": "string",
            "allowedValues": [
                "My"
            ],
            "defaultValue": "My",
            "metadata": {
                "description": "The store name where the cert will be deployed in the virtual machine"
            }
        },
        "certificateThumbprint": {
            "type": "string",
            "metadata": {
                "description": "Certificate Thumbprint"
            }
        },
        "KeyVaultResourceId": {
            "type": "string",
            "metadata": {
                "description": "Resource Id of the key vault, is should be in the format of /subscriptions/<Sub ID>/resourceGroups/<Resource group name>/providers/Microsoft.KeyVault/vaults/<vault name>"
            }
        },
        "certificateUrlValue": {
            "type": "string",
            "metadata": {
                "description": "Refers to the clusterloaction URL in your key vault where the certificate was uploaded, it is should be in the format of https://<name of the vault>.vault.azure.net:443/secrets/<exact clusterloaction>"
            }
        },
        "clusterProtectionLevel": {
            "type": "string",
            "allowedValues": [
                "None",
                "Sign",
                "EncryptAndSign"
            ],
            "defaultValue": "EncryptAndSign",
            "metadata": {
                "description": "Protection level.Three values are allowed - EncryptAndSign, Sign, None. It is best to keep the default of EncryptAndSign, unless you have a need not to"
            }
        },
        "ntInstanceCount": {
            "type": "string",
            "defaultValue": "5",
            "metadata": {
                "description": "Instance count for node type"
            }
        },
        "nodeDataDrive": {
            "type": "string",
            "defaultValue": "Temp",
            "allowedValues": [
                "OS",
                "Temp"
            ],
            "metadata": {
                "description": "The drive to use to store data on a cluster node."
            }
        },
        "nodeTypeSize": {
            "type": "string",
            "defaultValue": "Standard_D2_v2",
            "metadata": {
                "description": "The VM size to use for cluster nodes."
            }
        },
        "durabilityLevel": {
            "type": "string",
            "defaultValue": "Bronze",
            "allowedValues": [
                "Bronze",
                "Silver",
                "Gold"
            ],
            "metadata": {
                "description": "The drive to use to store data on a cluster node."
            }
        },
        "VirtualNetwork-Name": {
            "type": "string",
            "metadata": {
                "description": "The VM size to use for cluster nodes."
            }
        },
        "VirtualNetwork-AddressSapce": {
            "type": "string",
            "metadata": {
                "description": "The VM size to use for cluster nodes."
            }
        },
        "Subnet-Name": {
            "type": "string",
            "metadata": {
                "description": "The VM size to use for cluster nodes."
            }
        },
        "Subnet-AdressSpace-default": {
            "type": "string",
            "metadata": {
                "description": "The VM size to use for cluster nodes."
            }
        }
    },
    "variables": {
        "dnsName": "[concat(parameters('clusterName'), '-dns')]",
        "vmName": "VM",
        "virtualNetworkName": "[parameters('VirtualNetwork-Name')]",
        "addressPrefix": "[parameters('VirtualNetwork-AddressSapce')]",
        "nicName": "[concat(parameters('clusterName'), '-NIC')]",
        "lbIPName": "PublicIP-LB-FE",
        "overProvision": false,
        "nt0applicationStartPort": "20000",
        "nt0applicationEndPort": "30000",
        "nt0ephemeralStartPort": "49152",
        "nt0ephemeralEndPort": "65534",
        "nt0fabricTcpGatewayPort": "19000",
        "nt0fabricHttpGatewayPort": "19080",
        "subnet0Name": "[parameters('Subnet-Name')]",
        "subnet0Prefix": "[parameters('Subnet-AdressSpace-default')]",
        "subnet0Ref": "[resourceId('Microsoft.Network/virtualNetworks/subnets/', variables('virtualNetworkName'), variables('subnet0Name'))]",
        "supportLogStorageAccountName": "[concat(parameters('clusterName'), uniqueString(resourceGroup().id),'5')]",
        "applicationDiagnosticsStorageAccountName": "[concat (parameters('clusterName'),uniqueString(resourceGroup().id), '3' )]",
        "lbName": "[concat('LB','-', parameters('clusterName'),'-',variables('vmNodeType0Name'))]",
        "lbIPConfig0": "[resourceId('Microsoft.Network/loadBalancers/frontendIPConfigurations/', variables('lbName'), 'LoadBalancerIPConfig')]",
        "lbPoolID0": "[resourceId('Microsoft.Network/loadBalancers/backendAddressPools', variables('lbName'), 'LoadBalancerBEAddressPool')]",
        "lbProbeID0": "[resourceId('Microsoft.Network/loadBalancers/probes', variables('lbName'), 'FabricGatewayProbe')]",
        "lbHttpProbeID0": "[resourceId('Microsoft.Network/loadBalancers/probes', variables('lbName'), 'FabricHttpGatewayProbe')]",
        "lbNatPoolID0": "[resourceId('Microsoft.Network/loadBalancers/inboundNatPools', variables('lbName'), 'LoadBalancerBEAddressNatPool')]",
        "vmNodeType0Name": "[toLower(concat('cluster', variables('vmName')))]",
        "vmNodeType0Size": "[parameters('nodeTypeSize')]"
    },
    "resources": [
        {
            "apiVersion": "2019-04-01",
            "type": "Microsoft.Storage/storageAccounts",
            "name": "[variables('supportLogStorageAccountName')]",
            "location": "[parameters('clusterloaction')]",
            "properties": {},
            "kind": "Storage",
            "sku": {
                "name": "Standard_LRS"
            },
            "tags": {
                "resourceType": "Service Fabric",
                "clusterName": "[parameters('clusterName')]"
            }
        },
        {
            "apiVersion": "2019-04-01",
            "type": "Microsoft.Storage/storageAccounts",
            "name": "[variables('applicationDiagnosticsStorageAccountName')]",
            "location": "[parameters('clusterloaction')]",
            "properties": {},
            "kind": "Storage",
            "sku": {
                "name": "Standard_LRS"
            },
            "tags": {
                "resourceType": "Service Fabric",
                "clusterName": "[parameters('clusterName')]"
            }
        },
        {
            "apiVersion": "2018-08-01",
            "type": "Microsoft.Network/virtualNetworks",
            "name": "[variables('virtualNetworkName')]",
            "location": "[parameters('clusterloaction')]",
            "properties": {
                "addressSpace": {
                    "addressPrefixes": [
                        "[variables('addressPrefix')]"
                    ]
                },
                "subnets": [
                    {
                        "name": "[variables('subnet0Name')]",
                        "properties": {
                            "addressPrefix": "[variables('subnet0Prefix')]"
                        }
                    }
                ]
            },
            "tags": {
                "resourceType": "Service Fabric",
                "clusterName": "[parameters('clusterName')]"
            }
        },
        {
            "apiVersion": "2018-08-01",
            "type": "Microsoft.Network/publicIPAddresses",
            "name": "[variables('lbIPName')]",
            "location": "[parameters('clusterloaction')]",
            "properties": {
                "dnsSettings": {
                    "domainNameLabel": "[variables('dnsName')]"
                },
                "publicIPAllocationMethod": "Dynamic"
            },
            "tags": {
                "resourceType": "Service Fabric",
                "clusterName": "[parameters('clusterName')]"
            }
        },
        {
            "apiVersion": "2018-08-01",
            "type": "Microsoft.Network/loadBalancers",
            "name": "[variables('lbName')]",
            "location": "[parameters('clusterloaction')]",
            "dependsOn": [
                "[variables('lbIPName')]"
            ],
            "properties": {
                "frontendIPConfigurations": [
                    {
                        "name": "LoadBalancerIPConfig",
                        "properties": {
                            "publicIPAddress": {
                                "id": "[resourceId('Microsoft.Network/publicIPAddresses', variables('lbIPName'))]"
                            }
                        }
                    }
                ],
                "backendAddressPools": [
                    {
                        "name": "LoadBalancerBEAddressPool",
                        "properties": {}
                    }
                ],
                "loadBalancingRules": [
                    {
                        "name": "LBRule",
                        "properties": {
                            "backendAddressPool": {
                                "id": "[variables('lbPoolID0')]"
                            },
                            "backendPort": "[variables('nt0fabricTcpGatewayPort')]",
                            "enableFloatingIP": false,
                            "frontendIPConfiguration": {
                                "id": "[variables('lbIPConfig0')]"
                            },
                            "frontendPort": "[variables('nt0fabricTcpGatewayPort')]",
                            "idleTimeoutInMinutes": 5,
                            "probe": {
                                "id": "[variables('lbProbeID0')]"
                            },
                            "protocol": "Tcp"
                        }
                    },
                    {
                        "name": "LBHttpRule",
                        "properties": {
                            "backendAddressPool": {
                                "id": "[variables('lbPoolID0')]"
                            },
                            "backendPort": "[variables('nt0fabricHttpGatewayPort')]",
                            "enableFloatingIP": false,
                            "frontendIPConfiguration": {
                                "id": "[variables('lbIPConfig0')]"
                            },
                            "frontendPort": "[variables('nt0fabricHttpGatewayPort')]",
                            "idleTimeoutInMinutes": 5,
                            "probe": {
                                "id": "[variables('lbHttpProbeID0')]"
                            },
                            "protocol": "Tcp"
                        }
                    },
                    {
                        "name": "AppPortLBRule1",
                        "properties": {
                            "backendAddressPool": {
                                "id": "[variables('lbPoolID0')]"
                            },
                            "backendPort": "[parameters('loadBalancedAppPort1')]",
                            "enableFloatingIP": false,
                            "frontendIPConfiguration": {
                                "id": "[variables('lbIPConfig0')]"
                            },
                            "frontendPort": "[parameters('loadBalancedAppPort1')]",
                            "idleTimeoutInMinutes": 5,
                            "probe": {
                                "id": "[resourceId('Microsoft.Network/loadBalancers/probes',  variables('lbName'), 'AppPortProbe1')]"
                            },
                            "protocol": "Tcp"
                        }
                    },
                    {
                        "name": "AppPortLBRule2",
                        "properties": {
                            "backendAddressPool": {
                                "id": "[variables('lbPoolID0')]"
                            },
                            "backendPort": "[parameters('loadBalancedAppPort2')]",
                            "enableFloatingIP": false,
                            "frontendIPConfiguration": {
                                "id": "[variables('lbIPConfig0')]"
                            },
                            "frontendPort": "[parameters('loadBalancedAppPort2')]",
                            "idleTimeoutInMinutes": 5,
                            "probe": {
                                "id": "[resourceId('Microsoft.Network/loadBalancers/probes', variables('lbName'), 'AppPortProbe2')]"
                            },
                            "protocol": "Tcp"
                        }
                    }
                ],
                "probes": [
                    {
                        "name": "FabricGatewayProbe",
                        "properties": {
                            "intervalInSeconds": 5,
                            "numberOfProbes": 2,
                            "port": "[variables('nt0fabricTcpGatewayPort')]",
                            "protocol": "Tcp"
                        }
                    },
                    {
                        "name": "FabricHttpGatewayProbe",
                        "properties": {
                            "intervalInSeconds": 5,
                            "numberOfProbes": 2,
                            "port": "[variables('nt0fabricHttpGatewayPort')]",
                            "protocol": "Tcp"
                        }
                    },
                    {
                        "name": "AppPortProbe1",
                        "properties": {
                            "intervalInSeconds": 5,
                            "numberOfProbes": 2,
                            "port": "[parameters('loadBalancedAppPort1')]",
                            "protocol": "Tcp"
                        }
                    },
                    {
                        "name": "AppPortProbe2",
                        "properties": {
                            "intervalInSeconds": 5,
                            "numberOfProbes": 2,
                            "port": "[parameters('loadBalancedAppPort2')]",
                            "protocol": "Tcp"
                        }
                    }
                ],
                "inboundNatPools": [
                    {
                        "name": "LoadBalancerBEAddressNatPool",
                        "properties": {
                            "backendPort": 3389,
                            "frontendIPConfiguration": {
                                "id": "[variables('lbIPConfig0')]"
                            },
                            "frontendPortRangeEnd": 4500,
                            "frontendPortRangeStart": 3389,
                            "protocol": "Tcp"
                        }
                    }
                ]
            },
            "tags": {
                "resourceType": "Service Fabric",
                "clusterName": "[parameters('clusterName')]"
            }
        },
        {
            "apiVersion": "2018-10-01",
            "type": "Microsoft.Compute/virtualMachineScaleSets",
            "name": "[variables('vmNodeType0Name')]",
            "location": "[parameters('clusterloaction')]",
            "dependsOn": [
                "[variables('virtualNetworkName')]",
                "[variables('lbName')]",
                "[variables('supportLogStorageAccountName')]",
                "[variables('applicationDiagnosticsStorageAccountName')]"
            ],
            "properties": {
                "overprovision": "[variables('overProvision')]",
                "upgradePolicy": {
                    "mode": "Automatic"
                },
                "virtualMachineProfile": {
                    "extensionProfile": {
                        "extensions": [
                            {
                                "name": "[concat('ServiceFabricNodeVmExt','_vmNodeType0Name')]",
                                "properties": {
                                    "type": "ServiceFabricNode",
                                    "autoUpgradeMinorVersion": true,
                                    "protectedSettings": {
                                        "StorageAccountKey1": "[listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('supportLogStorageAccountName')),'2015-05-01-preview').key1]",
                                        "StorageAccountKey2": "[listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('supportLogStorageAccountName')),'2015-05-01-preview').key2]"
                                    },
                                    "publisher": "Microsoft.Azure.ServiceFabric",
                                    "settings": {
                                        "clusterEndpoint": "[reference(parameters('clusterName')).clusterEndpoint]",
                                        "nodeTypeRef": "[variables('vmNodeType0Name')]",
                                        "dataPath": "[concat(if(equals(parameters('nodeDataDrive'), 'OS'), 'C', 'D'), ':\\\\SvcFab')]",
                                        "durabilityLevel": "[parameters('durabilityLevel')]",
                                        "nicPrefixOverride": "[variables('subnet0Prefix')]",
                                        "certificate": {
                                            "thumbprint": "[parameters('certificateThumbprint')]",
                                            "x509StoreName": "[parameters('certificateStoreValue')]"
                                        }
                                    },
                                    "typeHandlerVersion": "1.0"
                                }
                            },
                            {
                                "name": "[concat('VMDiagnosticsVmExt','_vmNodeType0Name')]",
                                "properties": {
                                    "type": "IaaSDiagnostics",
                                    "autoUpgradeMinorVersion": true,
                                    "protectedSettings": {
                                        "storageAccountName": "[variables('applicationDiagnosticsStorageAccountName')]",
                                        "storageAccountKey": "[listKeys(resourceId('Microsoft.Storage/storageAccounts', variables('applicationDiagnosticsStorageAccountName')),'2015-05-01-preview').key1]",
                                        "storageAccountEndPoint": "https://core.windows.net/"
                                    },
                                    "publisher": "Microsoft.Azure.Diagnostics",
                                    "settings": {
                                        "WadCfg": {
                                            "DiagnosticMonitorConfiguration": {
                                                "overallQuotaInMB": "50000",
                                                "EtwProviders": {
                                                    "EtwEventSourceProviderConfiguration": [
                                                        {
                                                            "provider": "Microsoft-ServiceFabric-Actors",
                                                            "scheduledTransferKeywordFilter": "1",
                                                            "scheduledTransferPeriod": "PT5M",
                                                            "DefaultEvents": {
                                                                "eventDestination": "ServiceFabricReliableActorEventTable"
                                                            }
                                                        },
                                                        {
                                                            "provider": "Microsoft-ServiceFabric-Services",
                                                            "scheduledTransferPeriod": "PT5M",
                                                            "DefaultEvents": {
                                                                "eventDestination": "ServiceFabricReliableServiceEventTable"
                                                            }
                                                        }
                                                    ],
                                                    "EtwManifestProviderConfiguration": [
                                                        {
                                                            "provider": "cbd93bc2-71e5-4566-b3a7-595d8eeca6e8",
                                                            "scheduledTransferLogLevelFilter": "Information",
                                                            "scheduledTransferKeywordFilter": "4611686018427387904",
                                                            "scheduledTransferPeriod": "PT5M",
                                                            "DefaultEvents": {
                                                                "eventDestination": "ServiceFabricSystemEventTable"
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        },
                                        "StorageAccount": "[variables('applicationDiagnosticsStorageAccountName')]"
                                    },
                                    "typeHandlerVersion": "1.5"
                                }
                            }
                        ]
                    },
                    "networkProfile": {
                        "networkInterfaceConfigurations": [
                            {
                                "name": "[concat(variables('nicName'), '-0')]",
                                "properties": {
                                    "ipConfigurations": [
                                        {
                                            "name": "[concat(variables('nicName'),'-',0)]",
                                            "properties": {
                                                "loadBalancerBackendAddressPools": [
                                                    {
                                                        "id": "[variables('lbPoolID0')]"
                                                    }
                                                ],
                                                "loadBalancerInboundNatPools": [
                                                    {
                                                        "id": "[variables('lbNatPoolID0')]"
                                                    }
                                                ],
                                                "subnet": {
                                                    "id": "[variables('subnet0Ref')]"
                                                }
                                            }
                                        }
                                    ],
                                    "primary": true
                                }
                            }
                        ]
                    },
                    "osProfile": {
                        "adminPassword": "[parameters('adminPassword')]",
                        "adminUsername": "[parameters('adminUsername')]",
                        "computernamePrefix": "[variables('vmNodeType0Name')]",
                        "secrets": [
                            {
                                "sourceVault": {
                                    "id": "[parameters('KeyVaultResourceId')]"
                                },
                                "vaultCertificates": [
                                    {
                                        "certificateStore": "[parameters('certificateStoreValue')]",
                                        "certificateUrl": "[parameters('certificateUrlValue')]"
                                    }
                                ]
                            }
                        ]
                    },
                    "storageProfile": {
                        "imageReference": {
                            "publisher": "[parameters('vmImagePublisher')]",
                            "offer": "[parameters('vmImageOffer')]",
                            "sku": "[parameters('vmImageSku')]",
                            "version": "[parameters('vmImageVersion')]"
                        },
                        "osDisk": {
                            "managedDisk": {
                                "storageAccountType": "Standard_LRS"
                            },
                            "caching": "ReadOnly",
                            "createOption": "FromImage"
                        }
                    }
                }
            },
            "sku": {
                "name": "[variables('vmNodeType0Size')]",
                "capacity": "[parameters('ntInstanceCount')]",
                "tier": "Standard"
            },
            "tags": {
                "resourceType": "Service Fabric",
                "clusterName": "[parameters('clusterName')]"
            }
        },
        {
            "apiVersion": "2018-02-01",
            "type": "Microsoft.ServiceFabric/clusters",
            "name": "[parameters('clusterName')]",
            "location": "[parameters('clusterloaction')]",
            "dependsOn": [
                "[variables('supportLogStorageAccountName')]"
            ],
            "properties": {
                "certificate": {
                    "thumbprint": "[parameters('certificateThumbprint')]",
                    "x509StoreName": "[parameters('certificateStoreValue')]"
                },
                "clusterState": "Default",
                "diagnosticsStorageAccountConfig": {
                    "blobEndpoint": "[reference(resourceId('Microsoft.Storage/storageAccounts', variables('supportLogStorageAccountName')), '2018-07-01').primaryEndpoints.blob]",
                    "protectedAccountKeyName": "StorageAccountKey1",
                    "queueEndpoint": "[reference(resourceId('Microsoft.Storage/storageAccounts', variables('supportLogStorageAccountName')), '2018-07-01').primaryEndpoints.queue]",
                    "storageAccountName": "[variables('supportLogStorageAccountName')]",
                    "tableEndpoint": "[reference(resourceId('Microsoft.Storage/storageAccounts', variables('supportLogStorageAccountName')), '2018-07-01').primaryEndpoints.table]"
                },
                "fabricSettings": [
                    {
                        "parameters": [
                            {
                                "name": "ClusterProtectionLevel",
                                "value": "[parameters('clusterProtectionLevel')]"
                            }
                        ],
                        "name": "Security"
                    }
                ],
                "managementEndpoint": "[concat('https://',reference(variables('lbIPName')).dnsSettings.fqdn,':',variables('nt0fabricHttpGatewayPort'))]",
                "nodeTypes": [
                    {
                        "name": "[variables('vmNodeType0Name')]",
                        "applicationPorts": {
                            "endPort": "[variables('nt0applicationEndPort')]",
                            "startPort": "[variables('nt0applicationStartPort')]"
                        },
                        "clientConnectionEndpointPort": "[variables('nt0fabricTcpGatewayPort')]",
                        "durabilityLevel": "[parameters('durabilityLevel')]",
                        "ephemeralPorts": {
                            "endPort": "[variables('nt0ephemeralEndPort')]",
                            "startPort": "[variables('nt0ephemeralStartPort')]"
                        },
                        "httpGatewayEndpointPort": "[variables('nt0fabricHttpGatewayPort')]",
                        "isPrimary": true,
                        "vmInstanceCount": "[parameters('ntInstanceCount')]"
                    }
                ],
                "provisioningState": "Default",
                "reliabilityLevel": "Silver",
                "upgradeMode": "Automatic",
                "vmImage": "Windows"
            },
            "tags": {
                "resourceType": "Service Fabric",
                "clusterName": "[parameters('clusterName')]"
            }
        }
    ],
    "outputs": {
        "clusterProperties": {
            "value": "[reference(parameters('clusterName'))]",
            "type": "object"
        }
    }
}
 DEPLOY


  deployment_mode = "Incremental"
} 
 