
resource "azurerm_resource_group" "PAN_FW_RG" {
  name = "${var.resource_group_name}"
  location = "${var.location}"
}

resource "azurerm_storage_account" "PAN_FW_STG_AC" {
  name = "${var.StorageAccountName}"
  resource_group_name = "${azurerm_resource_group.PAN_FW_RG.name}"
  location = "${var.location}"
  #account_type = "${var.storageAccountType}"
  account_replication_type = "LRS"
  account_tier = "Standard"
}

resource "azurerm_public_ip" "PublicIP_0" {
  name = "${var.fwpublicIPName}"
  location = "${var.location}"
  resource_group_name = "${azurerm_resource_group.PAN_FW_RG.name}"
  allocation_method   = "Static"
    domain_name_label = "${var.FirewallDnsName}"
}

resource "azurerm_network_security_group" "PAN_FW_NSG" {
  name                = "${var.SubnetName1}-NSG"
  location            = "${var.location}"
  resource_group_name = "${azurerm_resource_group.PAN_FW_RG.name}"

  security_rule {
    name                       = "Allow-Outside-From-IP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "${var.FromGatewayLogin}"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Allow-Intra"
    priority                   = 101
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Deafult-Deny"
    priority                   = 200
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowVnetOutbound"
    priority                   = 4000
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "10.5.0.0/16"
    destination_address_prefix = "10.5.0.0/16"
  }

  security_rule {
    name                       = "AllowInternetOutbound"
    priority                   = 4001
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "0.0.0.0/0"
  }

  security_rule {
    name                       = "DenyAllOutbound"
    priority                   = 4095
    direction                  = "Outbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }


}

resource "azurerm_virtual_network" "PAN_FW_VNET" {
  name                = "${var.VirtualNetworkName}"
  resource_group_name = "${azurerm_resource_group.PAN_FW_RG.name}"
  address_space       = ["${var.VirtualNetworkAddressSapace}"]
  location            = "${var.location}"
}


resource "azurerm_subnet" "PAN_FW_Subnet0" {
  name           = "${var.SubnetName1}"
  resource_group_name = "${azurerm_resource_group.PAN_FW_RG.name}"
  address_prefix = "${var.SubnetAddressPrefix1}"
  network_security_group_id = "${azurerm_network_security_group.PAN_FW_NSG.id}"
  virtual_network_name = "${azurerm_virtual_network.PAN_FW_VNET.name}"
}



resource "azurerm_subnet" "PAN_FW_Subnet1" {
  name           = "${var.subnetName2}"
  resource_group_name = "${azurerm_resource_group.PAN_FW_RG.name}"
  address_prefix = "${var.SubnetAddressPrefix2}"
  virtual_network_name = "${azurerm_virtual_network.PAN_FW_VNET.name}"
}




resource "azurerm_subnet" "PAN_FW_Subnet2" {
  name           = "${var.SubnetName3}"
  resource_group_name = "${azurerm_resource_group.PAN_FW_RG.name}"
  address_prefix = "${var.SubnetAddressPrefix3}"
  virtual_network_name = "${azurerm_virtual_network.PAN_FW_VNET.name}"
}



resource "azurerm_network_interface" "VNIC1" {
  name                = "${var.FirewallVmName}-NIC1"
  location            = "${var.location}"
  resource_group_name = "${azurerm_resource_group.PAN_FW_RG.name}"
  depends_on          = ["azurerm_virtual_network.PAN_FW_VNET",
                          "azurerm_public_ip.PublicIP_0"]

  ip_configuration {
    name                          = "${var.FirewallVmName}-NIC-IPConfig"
    subnet_id                     = "${azurerm_subnet.PAN_FW_Subnet0.id}"
    private_ip_address_allocation = "dynamic"
    #private_ip_address = "${join("", list(var.IPAddressPrefix, ".0.4"))}"
    public_ip_address_id = "${azurerm_public_ip.PublicIP_0.id}"
  }


}

resource "azurerm_network_interface" "VNIC2" {
  name                = "${var.FirewallVmName}-NIC2"
  location            = "${var.location}"
  resource_group_name = "${azurerm_resource_group.PAN_FW_RG.name}"
  depends_on          = ["azurerm_virtual_network.PAN_FW_VNET"]

  enable_ip_forwarding = true
  ip_configuration {
    name                          = "${var.FirewallVmName}-NIC-IPConfig"
    subnet_id                     = "${azurerm_subnet.PAN_FW_Subnet1.id}"
    private_ip_address_allocation = "dynamic"
    #private_ip_address = "${join("", list(var.IPAddressPrefix, ".1.4"))}"
    #public_ip_address_id = "${azurerm_public_ip.PublicIP_0.id}"
  }


}

resource "azurerm_network_interface" "VNIC3" {
  name                = "${var.FirewallVmName}-NIC3"
  location            = "${var.location}"
  resource_group_name = "${azurerm_resource_group.PAN_FW_RG.name}"
  depends_on          = ["azurerm_virtual_network.PAN_FW_VNET"]

  enable_ip_forwarding = true
  ip_configuration {
    name                          = "${var.FirewallVmName}-NIC-IPConfig"
    subnet_id                     = "${azurerm_subnet.PAN_FW_Subnet2.id}"
    private_ip_address_allocation = "dynamic"
     #   private_ip_address = "${join("", list(var.IPAddressPrefix, ".2.4"))}"
    #public_ip_address_id = "${azurerm_public_ip.PublicIP_0.id}"
  }


}


resource "azurerm_virtual_machine" "PAN_FW_FW" {
  name                  = "${var.FirewallVmName}"
  location              = "${var.location}"
  resource_group_name   = "${azurerm_resource_group.PAN_FW_RG.name}"
  vm_size               = "${var.FirewallVmSize}"

  depends_on = ["azurerm_network_interface.VNIC1",
                "azurerm_network_interface.VNIC2",
                "azurerm_network_interface.VNIC3"
                ]
  plan {
    name = "${var.fwSku}"
    publisher = "paloaltonetworks"
    product = "vmseries1"
  }

  storage_image_reference {
    publisher = "paloaltonetworks"
    offer     = "vmseries1"
    sku       = "${var.fwSku}"
    version   = "${var.FWVersion}"
  }

  storage_os_disk {
    name          = "${join("", list(var.FirewallVmName, "-osDisk"))}"
    caching       = "ReadWrite"
    create_option = "FromImage"
  }

  os_profile {
    computer_name  = "${var.FirewallVmName}"
    admin_username = "${var.adminUsername}"
    admin_password = "${var.adminPassword}"
  }

  primary_network_interface_id = "${azurerm_network_interface.VNIC1.id}"
  network_interface_ids = ["${azurerm_network_interface.VNIC1.id}",
                           "${azurerm_network_interface.VNIC2.id}",
                           "${azurerm_network_interface.VNIC3.id}",
                          ]

  os_profile_linux_config {
    disable_password_authentication = false
  }
}
