resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_template_deployment" "example" {
  name                 = "newtemplate"
  resource_group_name   = azurerm_resource_group.example.name
parameters = {
        "subscription" ="${var.subscription_id}"
        "resourceGroup" ="${var.Resource_Group}"
         "location" ="${var.location}"
        "hostpoolName" = "${var.hostpoolName}"
        "workSpaceName" = "${var.workSpaceName}"
	     "workspaceLocation"="${var.ExistingVnetlocation}" 
        "workspaceResourceGroup" ="${var.Resource_Group}"
        "administratorAccountUsername" ="${var.administratorAccountUsername}"
        "administratorAccountPassword"= "${var.administratorAccountPassword}"
        "vmResourceGroup" = "${var.Resource_Group}"
        "vmLocation" = "${var.ExistingVnetlocation}"
        "vmSize"     = "${var.vmSize}"
        "vmNumberOfInstances" ="${var.vmNumberOfInstances}"
        "vmNamePrefix"    = "${var.vmNamePrefix}"
        "vmGalleryImageOffer" = "${var.vmGalleryImageOffer}"
        "vmGalleryImagePublisher" ="${var.vmGalleryImagePublisher}"
        "vmGalleryImageSKU" = "${var.vmGalleryImageSKU}"
        "existingVnetName" = "${var.existingaddsVnetName}"
        "existingSubnetName"= "${var.existingSubnetName}"
		"ExistingVnetlocation"= "${var.ExistingVnetlocation}"
        "virtualNetworkResourceGroupName"= "${var.virtualNetworkResourceGroupName}"
        "hostpoolType" = "${var.hostpoolType}"
        "personalDesktopAssignmentType" = "${var.personalDesktopAssignmentType}"
        "loadBalancerType" = "${var.loadBalancerType}"
        "domain" = "${var.domaintojoin}"
        "tokenExpirationTime" = "${var.tokenExpirationTime}"
     }
  template_body = <<DEPLOY
{
	"$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
	"contentVersion": "1.0.0.0",
	"parameters": {
		"nestedTemplatesLocation": {
			"defaultValue": "https://catalogartifact.azureedge.net/publicartifacts/Microsoft.Hostpool-ARM-1.0.13-preview/",
			"type": "String",
			"metadata": {
				"description": "The base URI where artifacts required by this template are located."
			}
		},
		"artifactsLocation": {
			"defaultValue": "https://wvdportalstorageblob.blob.core.windows.net/galleryartifacts/Configuration.zip",
			"type": "String",
			"metadata": {
				"description": "The base URI where artifacts required by this template are located."
			}
		},
		"subscription": {
			"type": "String",
			"defaultValue": "",
			"metadata": {
				"description": "The subscription Id."
			}
		},
		"resourceGroup": {
			"type": "String",
			"defaultValue": "",
			"metadata": {
				"description": "The resource group Name"
			}
		},
		"hostpoolName": {
			"type": "String",
			"defaultValue": "",
			"metadata": {
				"description": "The name of the Hostpool to be created."
			}
		},
		"hostpoolFriendlyName": {
			"defaultValue": "myhostpool",
			"type": "String",
			"metadata": {
				"description": "The friendly name of the Hostpool to be created."
			}
		},
		"hostpoolDescription": {
			"defaultValue": "the new hostpool",
			"type": "String",
			"metadata": {
				"description": "The description of the Hostpool to be created."
			}
		},
		"location": {
			"type": "String",
			"defaultValue": "",
			"metadata": {
				"description": "The location where the resources will be deployed."
			}
		},
		"workSpaceName": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "The name of the workspace to be attach to new Applicaiton Group."
			}
		},
		"workspaceLocation": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "The location of the workspace."
			}
		},
		"workspaceResourceGroup": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "The workspace resource group Name."
			}
		},

		"administratorAccountUsername": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "A username in the domain that has privileges to join the session hosts to the domain. For example, 'user1@contoso.com'."
			}
		},
		"administratorAccountPassword": {
			"defaultValue": "",
			"type": "SecureString",
			"metadata": {
				"description": "The password that corresponds to the existing domain username."
			}
		},
		"createAvailabilitySet": {
			"defaultValue": true,
			"type": "Bool",
			"metadata": {
				"description": "Whether to create a new availability set for the VMs"
			}
		},
		"vmResourceGroup": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "The resource group of the session host VMs."
			}
		},
		"vmLocation": {
			"defaultValue": "eastus",
			"type": "String",
			"metadata": {
				"description": "The location of the session host VMs."
			}
		},
		"vmSize": {
			"defaultValue": "Standard_B2ms",
			"type": "String",
			"metadata": {
				"description": "The size of the session host VMs."
			}
		},
		"vmNumberOfInstances": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "Number of session hosts that will be created and added to the hostpool."
			}
		},
		"vmNamePrefix": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "This prefix will be used in combination with the VM number to create the VM name. If using 'rdsh' as the prefix, VMs would be named 'rdsh-0', 'rdsh-1', etc. You should use a unique prefix to reduce name collisions in Active Directory."
			}
		},
		"vmImageType": {
			"defaultValue": "Gallery",
			"allowedValues": [
				"CustomVHD",
				"CustomImage",
				"Gallery"
			],
			"type": "String",
			"metadata": {
				"description": "Select the image source for the session host vms. VMs from a Gallery image will be created with Managed Disks."
			}
		},
		"vmGalleryImageOffer": {
			"defaultValue": "Windows-10",
			"type": "String",
			"metadata": {
				"description": "(Required when vmImageType = Gallery) Gallery image Offer."
			}
		},
		"vmGalleryImagePublisher": {
			"defaultValue": "MicrosoftWindowsDesktop",
			"type": "String",
			"metadata": {
				"description": "(Required when vmImageType = Gallery) Gallery image Publisher."
			}
		},
		"vmGalleryImageSKU": {
			"defaultValue": "19h2-evd",
			"type": "String",
			"metadata": {
				"description": "(Required when vmImageType = Gallery) Gallery image SKU."
			}
		},
		"vmImageVhdUri": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "(Required when vmImageType = CustomVHD) URI of the sysprepped image vhd file to be used to create the session host VMs. For example, https://rdsstorage.blob.core.windows.net/vhds/sessionhostimage.vhd"
			}
		},
		"vmCustomImageSourceId": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "(Required when vmImageType = CustomImage) Resource ID of the image"
			}
		},
		"vmDiskType": {
			"defaultValue": "StandardSSD_LRS",
			"allowedValues": [
				"UltraSSD_LRS",
				"Premium_LRS",
				"StandardSSD_LRS",
				"Standard_LRS"
			],
			"type": "String",
			"metadata": {
				"description": "The VM disk type for the VM: HDD or SSD."
			}
		},
		"vmUseManagedDisks": {
			"defaultValue": true,
			"type": "Bool",
			"metadata": {
				"description": "True indicating you would like to use managed disks or false indicating you would like to use unmanaged disks."
			}
		},
		"storageAccountResourceGroupName": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "(Required when vmUseManagedDisks = False) The resource group containing the storage account of the image vhd file."
			}
		},
		"existingVnetName": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "The name of the virtual network the VMs will be connected to."
			}
		},
		"existingSubnetName": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "The subnet the VMs will be placed in."
			}
		},
		"virtualNetworkResourceGroupName": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "The resource group containing the existing virtual network."
			}
		},
			"ExistingVnetlocation": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "The resource group containing the existing virtual network."
			}
		},
		"usePublicIP": {
			"defaultValue": false,
			"type": "Bool",
			"metadata": {
				"description": "Whether to use a Public IP"
			}
		},
		"publicIpAddressSku": {
			"defaultValue": "Basic",
			"allowedValues": [
				"Basic",
				"Standard"
			],
			"type": "String",
			"metadata": {
				"description": "The sku name of the Public IP"
			}
		},
		"publicIpAddressType": {
			"defaultValue": "Dynamic",
			"allowedValues": [
				"Dynamic",
				"Static"
			],
			"type": "String",
			"metadata": {
				"description": "The address type of the Public IP"
			}
		},
		"createNetworkSecurityGroup": {
			"defaultValue": false,
			"type": "Bool",
			"metadata": {
				"description": "Whether to create a new network security group or use an existing one"
			}
		},
		"networkSecurityGroupId": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "The resource id of an existing network security group"
			}
		},
		"networkSecurityGroupRules": {
			"defaultValue": [],
			"type": "Array",
			"metadata": {
				"description": "The rules to be given to the new network security group"
			}
		},
		"hostpoolType": {
			"allowedValues": [
				"Personal",
				"Pooled"
			],
			"type": "String",
			"metadata": {
				"description": "Set this parameter to Personal if you would like to enable Persistent Desktop experience. Defaults to false."
			}
		},
		"personalDesktopAssignmentType": {
			"defaultValue": "",
			"allowedValues": [
				"Automatic",
				"Direct",
				""
			],
			"type": "String",
			"metadata": {
				"description": "Set the type of assignment for a Personal hostpool type"
			}
		},
		"maxSessionLimit": {
			"defaultValue": 99999,
			"type": "Int",
			"metadata": {
				"description": "Maximum number of sessions."
			}
		},
		"loadBalancerType": {
			"defaultValue": "BreadthFirst",
			"allowedValues": [
				"BreadthFirst",
				"DepthFirst",
				"Persistent"
			],
			"type": "String",
			"metadata": {
				"description": "Type of load balancer algorithm."
			}
		},
		"ouPath": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "OUPath for the domain join"
			}
		},
		"allApplicationGroupReferences": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "The existing app groups references of the workspace selected."
			}
		},
		"customRdpProperty": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "Hostpool rdp properties"
			}
		},
		"vmTemplate": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "The necessary information for adding more VMs to this Hostpool"
			}
		},
		"apiVersion": {
			"defaultValue": "2019-12-10-preview",
			"type": "String",
			"metadata": {
				"description": "WVD api version"
			}
		},
		"deploymentId": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "GUID for the deployment"
			}
		},
		"validationEnvironment": {
			"defaultValue": false,
			"type": "Bool",
			"metadata": {
				"description": "Whether to use validation enviroment."
			}
		},
		"domain": {
			"defaultValue": "",
			"type": "String",
			"metadata": {
				"description": "Domain to join"
			}
		},
		"tokenExpirationTime": {
			"type": "String",
			"defaultValue": "2020-08-19T10:00:31.763Z",
			"metadata": {
				"description": "Hostpool token expiration time"
			}
		}
	},


	"variables": {
        "vmNumberOfInstancesint": "[int(parameters('vmNumberOfInstances'))]",
		"createVMs": "[greater(variables('vmNumberOfInstancesint'),0)]",
		"rdshManagedDisks": "[if(equals(parameters('vmImageType'), 'CustomVHD'), parameters('vmUseManagedDisks'), bool('true'))]",
		"rdshPrefix": "[concat(parameters('vmNamePrefix'),'-')]",
		"avSetSKU": "[if(variables('rdshManagedDisks'), 'Aligned', 'Classic')]",
		"existingDomainUsername": "[first(split(parameters('administratorAccountUsername'), '@'))]",
		"vhds": "[concat('vhds','/', variables('rdshPrefix'))]",
		"subnet-id": "[resourceId(parameters('virtualNetworkResourceGroupName'),'Microsoft.Network/virtualNetworks/subnets',parameters('existingVnetName'), parameters('existingSubnetName'))]",
		"resourceGroup": "[replace(parameters('resourceGroup'),'\"','')]",
		"hostpoolName": "[replace(parameters('hostpoolName'),'\"','')]",
		"hostpoolFriendlyName": "[parameters('hostpoolFriendlyName')]",
		"vmTemplateName": "[concat( if(variables('rdshManagedDisks'), 'managedDisks', 'unmanagedDisks'), '-', toLower(replace(parameters('vmImageType'),' ', '')), 'vm')]",
		"vmTemplateUri": "[concat(parameters('nestedTemplatesLocation'), variables('vmTemplateName'),'.json')]",
		"rdshVmNamesOutput": {
			"copy": [{
				"name": "rdshVmNamesCopy",
				"count": "[if(variables('createVMs'), variables('vmNumberOfInstancesint'), 1)]",
				"input": {
					"name": "[concat(variables('rdshPrefix'),copyIndex('rdshVmNamesCopy'))]"
				}
			}]
		},
		"appGroupName": "[concat(variables('hostpoolName'),'-DAG')]",
		"appGroupResourceId": "[createArray(resourceId('Microsoft.DesktopVirtualization/applicationgroups/', variables('appGroupName')))]",
		"workspaceResourceGroup": "[if(empty(parameters('workspaceResourceGroup')), parameters('resourceGroup'), parameters('workspaceResourceGroup'))]",
		"applicationGroupReferencesArr": "[if(equals('',parameters('allApplicationGroupReferences')), variables('appGroupResourceId'), concat(split(parameters('allApplicationGroupReferences'),','), variables('appGroupResourceId')))]"
	},
	"resources": [{
			"type": "Microsoft.DesktopVirtualization/hostpools",
			"apiVersion": "[parameters('apiVersion')]",
			"name": "[parameters('hostpoolName')]",
			"location": "[parameters('ExistingVnetlocation')]",
			"properties": {
				"friendlyName": "[parameters('hostpoolFriendlyName')]",
				"description": "[parameters('hostpoolDescription')]",
				"hostpoolType": "[parameters('hostpoolType')]",
				"customRdpProperty": "[parameters('customRdpProperty')]",
				"personalDesktopAssignmentType": "[parameters('personalDesktopAssignmentType')]",
				"maxSessionLimit": "[parameters('maxSessionLimit')]",
				"loadBalancerType": "[parameters('loadBalancerType')]",
				"validationEnvironment": "[parameters('validationEnvironment')]",
				"ring": null,
				"registrationInfo": {
					"expirationTime": "[parameters('tokenExpirationTime')]",
					"token": null,
					"registrationTokenOperation": "Update"
				},
				"vmTemplate": "[parameters('vmTemplate')]"
			}
		},
		{
			"type": "Microsoft.DesktopVirtualization/applicationgroups",
			"apiVersion": "[parameters('apiVersion')]",
			"name": "[variables('appGroupName')]",
			"location": "[parameters('ExistingVnetlocation')]",
			"dependsOn": [
				"[resourceId('Microsoft.DesktopVirtualization/hostpools/', parameters('hostpoolName'))]"
			],
			"properties": {
				"hostpoolarmpath": "[resourceId('Microsoft.DesktopVirtualization/hostpools/', parameters('hostpoolName'))]",
				"friendlyName": "Default Desktop",
				"description": "Desktop Application Group created through the Hostpool Wizard",
				"applicationGroupType": "Desktop"
			}
		},
		{
			"type": "Microsoft.Resources/deployments",
			"apiVersion": "2018-05-01",
			"name": "[concat('Workspace-linkedTemplate-', parameters('deploymentId'))]",
			"dependsOn": [
				"[resourceId('Microsoft.DesktopVirtualization/applicationgroups/', variables('appGroupName'))]"
			],
			"properties": {
				"mode": "Incremental",
				"template": {
					"$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
					"contentVersion": "1.0.0.0",
					"resources": [{
						"apiVersion": "[parameters('apiVersion')]",
						"name": "[parameters('workSpaceName')]",
						"type": "Microsoft.DesktopVirtualization/workspaces",
						"location": "[parameters('workspaceLocation')]",
						"properties": {
							"applicationGroupReferences": "[variables('applicationGroupReferencesArr')]"
						}
					}]
				}
			},
			"resourceGroup": "[variables('workspaceResourceGroup')]"
		},
		{
			"type": "Microsoft.Resources/deployments",
			"apiVersion": "2018-05-01",
			"name": "[concat('AVSet-linkedTemplate-', parameters('deploymentId'))]",
			"dependsOn": [
				"[resourceId('Microsoft.DesktopVirtualization/applicationgroups', variables('appGroupName'))]"
			],
			"properties": {
				"mode": "Incremental",
				"template": {
					"$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
					"contentVersion": "1.0.0.0",
					"resources": [{
						"apiVersion": "2018-10-01",
						"type": "Microsoft.Compute/availabilitySets",
                            "name": "[concat(variables('rdshPrefix'), 'availabilitySet-', parameters('vmLocation'))]",
						"location": "[parameters('vmLocation')]",
						"properties": {
							"platformUpdateDomainCount": 5,
							"platformFaultDomainCount": 2
						},
						"sku": {
							"name": "[variables('avSetSKU')]"
						}
					}]
				}
			},
			"resourceGroup": "[parameters('vmResourceGroup')]",
			"condition": "[parameters('createAvailabilitySet')]"
		},
		{
			"type": "Microsoft.Resources/deployments",
			"apiVersion": "2018-05-01",
			"name": "[concat('vmCreation-linkedTemplate-', parameters('deploymentId'))]",
			"dependsOn": [
				"[concat('AVSet-linkedTemplate-', parameters('deploymentId'))]"
			],
			"properties": {
				"mode": "Incremental",
				"templateLink": {
					"uri": "[variables('vmTemplateUri')]",
					"contentVersion": "1.0.0.0"
				},
				"parameters": {
					"artifactsLocation": {
						"value": "[parameters('artifactsLocation')]"
					},
					"vmImageVhdUri": {
						"value": "[parameters('vmImageVhdUri')]"
					},
					"storageAccountResourceGroupName": {
						"value": "[parameters('storageAccountResourceGroupName')]"
					},
					"vmGalleryImageOffer": {
						"value": "[parameters('vmGalleryImageOffer')]"
					},
					"vmGalleryImagePublisher": {
						"value": "[parameters('vmGalleryImagePublisher')]"
					},
					"vmGalleryImageSKU": {
						"value": "[parameters('vmGalleryImageSKU')]"
					},
					"rdshPrefix": {
						"value": "[variables('rdshPrefix')]"
					},
					"rdshNumberOfInstances": {
						"value": "[variables('vmNumberOfInstancesint')]"
					},
					"rdshVMDiskType": {
						"value": "[parameters('vmDiskType')]"
					},
					"rdshVmSize": {
						"value": "[parameters('vmSize')]"
					},
					"enableAcceleratedNetworking": {
						"value": false
					},
					"administratorAccountUsername": {
						"value": "[parameters('administratorAccountUsername')]"
					},
					"administratorAccountPassword": {
						"value": "[parameters('administratorAccountPassword')]"
					},
					"subnet-id": {
						"value": "[variables('subnet-id')]"
					},
					"vhds": {
						"value": "[variables('vhds')]"
					},
					"rdshImageSourceId": {
						"value": "[parameters('vmCustomImageSourceId')]"
					},
					"location": {
						"value": "[parameters('vmLocation')]"
					},
					"usePublicIP": {
						"value": "[parameters('usePublicIP')]"
					},
					"publicIpAddressType": {
						"value": "[parameters('publicIpAddressType')]"
					},
					"publicIpAddressSku": {
						"value": "[parameters('publicIpAddressSku')]"
					},
					"createNetworkSecurityGroup": {
						"value": "[parameters('createNetworkSecurityGroup')]"
					},
					"networkSecurityGroupId": {
						"value": "[parameters('networkSecurityGroupId')]"
					},
					"networkSecurityGroupRules": {
						"value": "[parameters('networkSecurityGroupRules')]"
					},
					"hostpoolToken": {
						"value": "[reference(parameters('hostpoolName')).registrationInfo.token]"
					},
					"hostpoolName": {
						"value": "[parameters('hostpoolName')]"
					},
					"domain": {
						"value": "[parameters('domain')]"
					},
					"ouPath": {
						"value": "[parameters('ouPath')]"
					},
					"_guidValue": {
						"value": "[parameters('deploymentId')]"
					}
				}
			},
			"resourceGroup": "[parameters('vmResourceGroup')]",
			"condition": "[variables('createVMs')]"
		}
	],
	"outputs": {
		"rdshVmNamesObject": {
			"type": "Object",
			"value": "[variables('rdshVmNamesOutput')]"
		}
	}
}
DEPLOY
deployment_mode = "Incremental"
}