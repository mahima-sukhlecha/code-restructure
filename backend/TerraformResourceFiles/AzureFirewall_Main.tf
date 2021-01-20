resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_virtual_network" "example" {
  name                ="${var.VirtualNetwork-Name}"
  address_space       = ["${var.VirtualNetwork-AddressSapce}"]
  location            = "${var.VirtualNetwork-location}"
  resource_group_name = "${azurerm_resource_group.example.name}"
}

resource "azurerm_subnet" "example" {
  name                 = "AzureFirewallSubnet"
  resource_group_name  = "${azurerm_resource_group.example.name}"
  virtual_network_name = "${azurerm_virtual_network.example.name}"
  address_prefix       = "${var.AzSubnet-AdressSpace}"
}
resource "azurerm_subnet" "default" {
  name                 = "${var.Subnet-Name}"
  resource_group_name  = "${azurerm_resource_group.example.name}"
  virtual_network_name = "${azurerm_virtual_network.example.name}"
  address_prefix       = "${var.Subnet-AdressSpace}"
}

resource "azurerm_public_ip" "example" {
  name                = "${var.Public-IP-Name}"
  location            = "${azurerm_resource_group.example.location}"
  resource_group_name = "${azurerm_resource_group.example.name}"
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_firewall" "example" {
  name                = "${var.Firewall-Name}"
  location            = "${var.AzureFirewall-location}"
  resource_group_name = "${azurerm_resource_group.example.name}"

  ip_configuration {
    name                 = "configuration"
    subnet_id            = "${azurerm_subnet.example.id}"
    public_ip_address_id = "${azurerm_public_ip.example.id}"
  }
}
resource "azurerm_firewall_nat_rule_collection" "example" {
  name                = "${var.RuleNatCollectionName}"
  azure_firewall_name = azurerm_firewall.example.name
  resource_group_name = azurerm_resource_group.example.name
  priority            = 100
  action              = "Dnat"

  rule {

    name = "${var.RuleName}"

    source_addresses = ["${var.Source_Address}"]
destination_ports = ["${var.Destination_Ports}"]

    destination_addresses = ["${azurerm_public_ip.example.ip_address}"]

    protocols = ["${var.Protocols}"]
    translated_address  = "${var.Translated_Address}"
    translated_port     = "${var.Translated_Port}"
  }
 
}

