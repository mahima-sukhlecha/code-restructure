resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_virtual_network" "example" {
  name                = "${var.VirtualNetwork-Name}"
  resource_group_name = azurerm_resource_group.example.name
  address_space       = ["${var.VirtualNetwork-AddressSapce}"]
  location            = "${var.VirtualNetwork-Loaction}"
}
resource "azurerm_subnet" "default" {
  name                 = "${var.Subnet-Name}"
  resource_group_name  = azurerm_resource_group.example.name
  virtual_network_name = azurerm_virtual_network.example.name
  address_prefix       = "${var.Subnet-AdressSpace-default}"
}