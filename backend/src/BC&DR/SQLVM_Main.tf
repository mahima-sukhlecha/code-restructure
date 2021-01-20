

resource "azurerm_resource_group" "RG-1" {
name =  "${var.RG-Name}"
location = "${var.RG-location}"
}

# Create virtual network
resource "azurerm_virtual_network" "myterraformnetwork" {
    name                = "${var.VNet-Name}"
    address_space       = ["${var.VNet-address-space}"]
    location            = "${var.location}"
    resource_group_name    = azurerm_resource_group.RG-1.name

    
}

# Create subnet
resource "azurerm_subnet" "myterraformsubnet" {
    name                         = "${var.Subnet-Name}"
    resource_group_name          = azurerm_resource_group.RG-1.name
    virtual_network_name         = azurerm_virtual_network.myterraformnetwork.name
    address_prefix               = "${var.subnetaddress-prefix}"
    
}

# Create public IPs
resource "azurerm_public_ip" "myterraformpublicip" {
    name                         = "${var.VM-Name}-IP"
    location                    = "${var.location}"
    resource_group_name          = azurerm_resource_group.RG-1.name
    allocation_method            = "Static"

    
}

# Create Network Security Group and rule
resource "azurerm_network_security_group" "myterraformnsg" {
    name                        = "${var.VM-Name}-NSG"
    location                    = "${var.location}"
    resource_group_name          = azurerm_resource_group.RG-1.name
    
    security_rule {
        name                       = "RDP"
        priority                   = 101
        direction                  = "Inbound"
        access                     = "Allow"
        protocol                   = "Tcp"
        source_port_range          = "*"
        destination_port_range     = "3389"
        source_address_prefix      = "*"
        destination_address_prefix = "*"
    }

     security_rule {
        name                       = "HTTPS"
        priority                   = 111
        direction                  = "Inbound"
        access                     = "Allow"
        protocol                   = "Tcp"
        source_port_range          = "*"
        destination_port_range     = "443"
        source_address_prefix      = "*"
        destination_address_prefix = "*"
    }
}

# Create network interface
resource "azurerm_network_interface" "myterraformnic" {
    name                            = "${var.VM-Name}-NIC"
    location                         = "${var.location}"
    resource_group_name              = azurerm_resource_group.RG-1.name
    network_security_group_id = "${azurerm_network_security_group.myterraformnsg.id}"
    depends_on                    = ["azurerm_subnet.myterraformsubnet"]


    ip_configuration {
        name                          = "${var.VM-Name}-NIC-IPConfig"
        subnet_id                     = azurerm_subnet.myterraformsubnet.id
        #subnet_id                     = "/subscriptions/98b7f374-098f-4d1e-98d1-a2ca9fc58c4c/resourceGroups/myrg113532/providers/Microsoft.Network/virtualNetworks/myVnet12/subnets/mySubnet123"
        private_ip_address_allocation = "Dynamic"
        public_ip_address_id          = azurerm_public_ip.myterraformpublicip.id
    }
    
}



# Create virtual machine
resource "azurerm_virtual_machine" "VM" {
    name                  = "${var.VM-Name}"
    location                    = "${var.location}"
    resource_group_name          = azurerm_resource_group.RG-1.name
    network_interface_ids = ["${azurerm_network_interface.myterraformnic.id}"]
    #vm_size               = "Standard_DS1_v2" 
    vm_size               = "${var.SQl-VM-size}" 

    storage_os_disk {
        name              = "${var.VM-Name}-osdisk"
        caching           = "ReadWrite"
        create_option     = "FromImage"
        managed_disk_type = "StandardSSD_LRS"
    }

    storage_image_reference {
        publisher = "${var.publisher}"
        #offer     = "SQL2016SP1-WS2016"
         offer   = "${var.offer}"

        sku       = "${var.sku}"
        version   = "latest"
 }

    os_profile {
   computer_name  = "${var.computer_name}"
   admin_username = "${var.admin_username}"
   admin_password = "${var.admin_password}"
 }

  os_profile_windows_config {
        enable_automatic_upgrades = false
	    provision_vm_agent = true
 
    }


  
}
resource "azurerm_template_deployment" "example" {
  name                = "acctesttemplate-12345"
  depends_on          = ["azurerm_virtual_machine.VM"]
  resource_group_name = azurerm_resource_group.RG-1.name
  deployment_mode    = "Incremental"
  parameters = {
        "virtualMachineName" = "${var.VM-Name}"
        "location" ="${var.location}"
        "username" ="${var.admin_username}"
        "password" ="${var.admin_password}"
        "fileuri" ="${var.fileuri}"
        "filename"="${var.filename}"
      }
    template_body = <<DEPLOY
 {
	"$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
	"contentVersion": "1.0.0.0",
	"parameters": {
		"virtualMachineName": {
			"type": "string"
		},
		"location": {
			"type": "string"
		},
        "fileuri":{
            "type":"string"
        },
        "username":{
            "type":"string"
        },
        "password":{
            "type":"string"
        },
        "filename":{
            "type":"string"
        }
	},
	"variables": {},
	"resources": [

		{
			"type": "Microsoft.SqlVirtualMachine/SqlVirtualMachines",
			"apiVersion": "2017-03-01-preview",
			"name": "[parameters('virtualMachineName')]",
			"location": "[parameters('location')]",

			"properties": {
				"virtualMachineResourceId": "[concat('/subscriptions/',subscription().subscriptionId,'/resourceGroups/',resourceGroup().name ,'/providers/','Microsoft.Compute/virtualMachines/',parameters('virtualMachineName'))]",
				"sqlServerLicenseType": "PAYG",
				"AutoPatchingSettings": {
					"Enable": true,
					"DayOfWeek": "Sunday",
					"MaintenanceWindowStartingHour": "2",
					"MaintenanceWindowDuration": "60"
				},

				"ServerConfigurationsManagementSettings": {
					"SQLConnectivityUpdateSettings": {
						"ConnectivityType": "Private",
						"Port": "1433",
						"SQLAuthUpdateUserName": "[parameters('username')]",
						"SQLAuthUpdatePassword": "[parameters('password')]"
					},
					"SQLWorkloadTypeUpdateSettings": {
						"SQLWorkloadType": "General"
					},

					"AdditionalFeaturesServerConfigurations": {
						"IsRServicesEnabled": "False"
					}
				}
			}
		},
		{
			"type": "Microsoft.Compute/virtualMachines/extensions",
			"apiVersion": "2018-06-01",
			"name": "[concat(parameters('virtualMachineName'), '/cseextension')]",
			"location": "[parameters('location')]",
			"dependsOn": [
				"[resourceId('Microsoft.SqlVirtualMachine/SqlVirtualMachines', parameters('virtualMachineName'))]"
			],
			"properties": {
				"publisher": "Microsoft.Compute",
				"type": "CustomScriptExtension",
				"typeHandlerVersion": "1.10",
				"autoUpgradeMinorVersion": true,
				"settings": {
					"fileUris": ["[parameters('fileuri')]"]
				},
				"protectedSettings": {
					"commandToExecute": "[concat('powershell -ExecutionPolicy Unrestricted -File ', parameters('filename'))]"

				}
			}
		}
	]
}
        DEPLOY
         
      
}

