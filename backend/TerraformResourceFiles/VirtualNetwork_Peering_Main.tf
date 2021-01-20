resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_virtual_network" "example-1" {
  name                = "${var.VirtualNetwork-Name}"
  resource_group_name = azurerm_resource_group.example.name
  address_space       = ["${var.VirtualNetwork-AddressSapce}"]
  location            = "${var.VirtualNetwork-Loaction}"
}
resource "azurerm_subnet" "default" {
  name                 = "${var.Subnet1-Name}"
  resource_group_name  = azurerm_resource_group.example.name
  virtual_network_name = azurerm_virtual_network.example-1.name
  address_prefix       = "${var.Subnet1-AdressSpace-default}"
}

resource "azurerm_virtual_network" "example-2" {
  name                = "${var.VirtualNetwork2-Name}"
  resource_group_name = azurerm_resource_group.example.name
  address_space       = ["${var.VirtualNetwork2-AddressSapce}"]
  location            = "${var.VirtualNetwork-Loaction}"
}
resource "azurerm_subnet" "default2" {
  name                 = "${var.Subnet2-Name}"
  resource_group_name  = azurerm_resource_group.example.name
  virtual_network_name = azurerm_virtual_network.example-2.name
  address_prefix       = "${var.Subnet2-AdressSpace-default}"
}

resource "azurerm_virtual_network_peering" "example-1" {
  name                      = "${var.VNet1toVnet2-PeeringName}"
  resource_group_name       = azurerm_resource_group.example.name
  virtual_network_name      = azurerm_virtual_network.example-1.name
  remote_virtual_network_id = azurerm_virtual_network.example-2.id
}

resource "azurerm_virtual_network_peering" "example-2" {
  name                      = "${var.Vnet2toVnet1-PeeringName}"
  resource_group_name       = azurerm_resource_group.example.name
  virtual_network_name      = azurerm_virtual_network.example-2.name
  remote_virtual_network_id = azurerm_virtual_network.example-1.id
}


