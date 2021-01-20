resource "azurerm_resource_group" "RG"{
    name = "${var.RG-1-Name}"
    location = "${var.RG-1-Location}"
    count =               "${var.VM-Count}"
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
  }
#Vnet
resource "azurerm_virtual_network" "VNet" {
  count =               "${var.VM-Count}"
  depends_on =         ["azurerm_resource_group.RG"]
  name                = "${element(var.VNET-1-Name, count.index)}"
  address_space       = ["${element(var.VNET-1-CIDR,count.index)}"]
  location            = "${element(var.VNET-1-Location,count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}
#Subnet
resource "azurerm_subnet" "Subnet" {
  count =               "${var.VM-Count}"
  depends_on            = ["azurerm_virtual_network.VNet"]
  name                 = "${element(var.Subnet-Name-1A, count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
  virtual_network_name = "${element(var.VNET-1-Name, count.index)}"
  address_prefix       = "${element(var.Subnet-CIDR-1A, count.index)}"
  network_security_group_id = "${element(azurerm_network_security_group.NSG.*.id, count.index)}"
  #tags  = "${merge(map("${element(var.VM_TagsKey, count.index)}","${element(var.VM_TagsValue, count.index)}","${element(var.VM_TagsKey, count.index+1)}", "${element(var.VM_TagsValue, count.index+1)}"))}"

}

output "ID-of-Subnet-A" {
	value = "${azurerm_subnet.Subnet.*.id}"
}

#AzureFirewallSubnet
resource "azurerm_subnet" "Firewall_Subnet" {
  count =               "${var.VM-Count}"
  depends_on            = ["azurerm_virtual_network.VNet"]
  name                 = "${element(var.AzureFirewallSubnet, count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
  virtual_network_name = "${element(var.AzureFirewallVnet, count.index)}"
  address_prefix       = "${element(var.AzureFirewallSubnet-CIDR, count.index)}"
  #tags  = "${merge(map("${element(var.VM_TagsKey, count.index)}","${element(var.VM_TagsValue, count.index)}","${element(var.VM_TagsKey, count.index+1)}", "${element(var.VM_TagsValue, count.index+1)}"))}"
}
#AzureFirewall-IP
resource "azurerm_public_ip" "Firewall_IP" {
  count               = "${var.VM-Count}"
  name                = "${element(var.AzureFirewallName, count.index)}-FWIP"
 depends_on =         ["azurerm_subnet.Firewall_Subnet"]
  location            = "${element(var.VNET-1-Location,count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
  allocation_method   = "Static"
  sku                 = "Standard"
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}
#Azurefirewall
resource "azurerm_firewall" "Firewall" {
  count =               "${var.VM-Count}"
  name                = "${element(var.AzureFirewallName, count.index)}"
  location            = "${element(var.VNET-1-Location,count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
  depends_on =         ["azurerm_subnet.Firewall_Subnet"] 

  ip_configuration {
    name                 = "configuration"
    subnet_id            = "${element(azurerm_subnet.Firewall_Subnet.*.id, count.index)}"
    public_ip_address_id = "${element(azurerm_public_ip.Firewall_IP.*.id, count.index)}"
  }
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}

#VM NSG with Avlset
resource "azurerm_network_security_group" "NSG" {
  count =               "${var.VM-Count}"
  name                = "${element(var.Subnet-Name-1A, count.index)}-NSG"
  location            = "${element(var.VNET-1-Location,count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
  depends_on            = ["azurerm_virtual_network.VNet"]
    security_rule {
    name                       = "RDP-In"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "3389"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "SSH-In"
    priority                   = 200
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}
#External-LoadBlancer-PublicIP
resource "azurerm_public_ip" "LB_IP" {
  count               = "${var.VM-Count}"
  name                = "${element(var.LoadBalncerName, count.index)}-LBIP"
  location            = "${element(var.VM-Location-WIN, count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
  depends_on =         ["azurerm_resource_group.RG"] 
  allocation_method   = "Static"
  sku                 = "Standard"
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}
#External-LoadBlancer
resource "azurerm_lb" "LB" {
  count               = "${var.VM-Count}"
  name                = "${element(var.LoadBalncerName, count.index)}"
  location            = "${element(var.VM-Location-WIN, count.index)}"
  depends_on =         ["azurerm_resource_group.RG"]
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
  sku                 = "Standard"
  frontend_ip_configuration {
  name                          = "PublicIPAddress"
  public_ip_address_id          = "${element(azurerm_public_ip.LB_IP.*.id, count.index)}"      
   }
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}

#WIN-VM-NIC 
resource "azurerm_network_interface" "WIN-NIC-NonAvlset" {
 count = "${var.VM-Count}"
 name                = "${element(var.WIN-VM-Name-NonAvlset, count.index)}-NIC"
 location            = "${element(var.VNET-1-Location, count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
  depends_on =         ["azurerm_subnet.Subnet"]
#network_security_group_id = "${element(azurerm_network_security_group.NSG.*.id, count.index)}"
 ip_configuration {
   name                          = "${element(var.WIN-VM-Name-NonAvlset, count.index)}"
   subnet_id                     ="/subscriptions/${var.subscription_id}/resourceGroups/${var.RG-1-Name}/providers/Microsoft.Network/virtualNetworks/${element(var.WIN-VNET-Name-NonAvlset, count.index)}/subnets/${element(var.WIN-Subnet-Name-NonAvlset,count.index)}"
   private_ip_address_allocation = "dynamic"
   #public_ip_address_id          = "${element(azurerm_public_ip.WIN-VM_IP-NonAvlset.*.id, count.index)}"
 }
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}
#WIN-VM 
resource "azurerm_virtual_machine" "WIN-VM-NonAvlset" {
    count                 = "${var.VM-Count}"
    name                  = "${element(var.WIN-VM-Name-NonAvlset, count.index)}"
    location              = "${element(var.VNET-1-Location, count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
    depends_on             = ["azurerm_network_interface.WIN-NIC-NonAvlset"]
    network_interface_ids = ["${element(azurerm_network_interface.WIN-NIC-NonAvlset.*.id, count.index)}"]
    vm_size               = "${element(var.WIN-VM-Size-NonAvlset, count.index)}" 


    storage_os_disk {
        name              = "${element(var.WIN-VM-Name-NonAvlset, count.index)}-OsDisk"
        caching           = "ReadWrite"
        create_option     = "FromImage"
        managed_disk_type = "Premium_LRS"
    } 

    storage_image_reference {
        publisher = "${element(var.WIN-VM-Publisher-NonAvlset, count.index)}"
        offer     = "${element(var.WIN-VM-Offer-NonAvlset, count.index)}"
        sku       = "${element(var.WIN-VM-Sku-NonAvlset, count.index)}"
        version   = "latest"
    }

    os_profile {
        computer_name  = "${element(var.WIN-VM-ComputerName-NonAvlset, count.index)}"
        admin_username = "${element(var.WIN-VM-UN-NonAvlset, count.index)}"
        admin_password = "${element(var.WIN-VM-PW-NonAvlset, count.index)}"
    }

    os_profile_windows_config {
        enable_automatic_upgrades = false
	    provision_vm_agent = true
    }
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}

#WIN-VM-PublicIP
/*resource "azurerm_public_ip" "WIN-VM_IP-NonAvlset" {
  count                        = "${var.VM-Count}"
  name                         = "${element(var.WIN-VM-Name-NonAvlset, count.index)}-VMIP"
  location                     = "${element(var.VNET-1-Location, count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
  depends_on                    =  ["azurerm_resource_group.RG"] 
  public_ip_address_allocation = "dynamic"
  ip_version                   = "IPv4"
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}
*/
#--------------------------------------------------------------------------------------------------------------------------#
#LNX-VM-NIC 
resource "azurerm_network_interface" "LNX-NIC-NonAvlset" {
 count = "${var.VM-Count}"
 name                = "${element(var.LNX-VM-Name-NonAvlset, count.index)}-NIC"
 location            = "${element(var.VNET-1-Location, count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
  depends_on =         ["azurerm_subnet.Subnet"]
#network_security_group_id = "${element(azurerm_network_security_group.NSG.*.id, count.index)}"
 ip_configuration {
   name                          = "${element(var.LNX-VM-Name-NonAvlset, count.index)}"
   subnet_id                     ="/subscriptions/${var.subscription_id}/resourceGroups/${var.RG-1-Name}/providers/Microsoft.Network/virtualNetworks/${element(var.LNX-VNET-Name-NonAvlset, count.index)}/subnets/${element(var.LNX-Subnet-Name-NonAvlset,count.index)}"
   private_ip_address_allocation = "dynamic"
   #public_ip_address_id          = "${element(azurerm_public_ip.LNX-VM_IP-NonAvlset.*.id, count.index)}"

 }
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}
#LNX-VM 
resource "azurerm_virtual_machine" "VM" {
    count                 = "${var.VM-Count}"
    name                  = "${element(var.LNX-VM-Name-NonAvlset, count.index)}"
    location              = "${element(var.VNET-1-Location, count.index)}"
    resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
    depends_on             = ["azurerm_network_interface.LNX-NIC-NonAvlset"]
    network_interface_ids = ["${element(azurerm_network_interface.LNX-NIC-NonAvlset.*.id, count.index)}"]
    vm_size               = "${element(var.LNX-VM-Size-NonAvlset, count.index)}" 


    storage_os_disk {
        name              = "${element(var.LNX-VM-Name-NonAvlset, count.index)}-OsDisk"
        caching           = "ReadWrite"
        create_option     = "FromImage"
        managed_disk_type = "Premium_LRS"
    } 

    storage_image_reference {
        publisher = "${element(var.LNX-VM-Publisher-NonAvlset, count.index)}"
        offer     = "${element(var.LNX-VM-Offer-NonAvlset, count.index)}"
        sku       = "${element(var.LNX-VM-Sku-NonAvlset, count.index)}"
        version   = "latest"
    }

    os_profile {
        computer_name  = "${element(var.LNX-VM-ComputerName-NonAvlset, count.index)}"
        admin_username = "${element(var.LNX-VM-UN-NonAvlset, count.index)}"
        admin_password = "${element(var.LNX-VM-PW-NonAvlset, count.index)}"
    }

    os_profile_linux_config {
    disable_password_authentication = false
  }
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}
/*
#LNX-VM-PublicIP without AvlSet
resource "azurerm_public_ip" "LNX-VM_IP-NonAvlset" {
  count                        = "${var.VM-Count}"
  name                         = "${element(var.LNX-VM-Name-NonAvlset, count.index)}-VMIP"
  location                     = "${element(var.VNET-1-Location, count.index)}"
  resource_group_name   = "${element(azurerm_resource_group.RG.*.name, count.index)}"
  depends_on                    =  ["azurerm_resource_group.RG"] 
  public_ip_address_allocation = "dynamic"
  ip_version                   = "IPv4"
    tags  = "${merge(map("${element(var.VM_TagsKey-proj, count.index)}","${element(var.VM_TagsValue-proj, count.index)}","${element(var.VM_TagsKey-env, count.index)}", "${element(var.VM_TagsValue-env, count.index)}"))}"
}
*/