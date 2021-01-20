resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_virtual_network" "example" {
  name                = "${var.VirtualNetwork-Name}"
  location            = "${var.VirtualNetwork-Loaction}"
  resource_group_name = azurerm_resource_group.example.name
  address_space       = ["${var.VirtualNetwork-AddressSapce}"]
}

resource "azurerm_subnet" "example" {
  name                 = "GatewaySubnet"
  resource_group_name  = azurerm_resource_group.example.name
  virtual_network_name = azurerm_virtual_network.example.name
  address_prefix       = "${var.GatewaySubnet-AdressSpace}"
}
resource "azurerm_subnet" "default" {
  name                 = "${var.Subnet-Name}"
  resource_group_name  = azurerm_resource_group.example.name
  virtual_network_name = azurerm_virtual_network.example.name
  address_prefix       = "${var.Subnet-AdressSpace-default}"
}
resource "azurerm_public_ip" "example" {
  name                = "${var.Public-IP-Name}"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name

  allocation_method = "Dynamic"
}

resource "azurerm_virtual_network_gateway" "example" {
  name                = "${var.VirtualNetwork-Gateway-Name}"
  location            = "${var.VirtualNetwork-Loaction}"
  resource_group_name = azurerm_resource_group.example.name

  type     = "Vpn"
  vpn_type = "RouteBased"

  active_active = false
  enable_bgp    = false
  sku           = "${var.VirtualNetwork-GatewaySKU}"

  ip_configuration {
    name                          = "vnetGatewayConfig"
    public_ip_address_id          = azurerm_public_ip.example.id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = azurerm_subnet.example.id
  }
}

resource "azurerm_local_network_gateway" "onpremise" {
  name                = "${var.LocalNetwork-Gateway-Name}"
  location            = "${var.localnetwork-location}"
  resource_group_name = azurerm_resource_group.example.name
  gateway_address     = "${var.On-premisesRouterPublicIp}"
  address_space       = ["${var.On-Premises-AddressSapce}"]
}
resource "azurerm_virtual_network_gateway_connection" "onpremise" {
  name                = "${var.Gateway-ConnectionName}"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name

  type                       = "IPsec"
  virtual_network_gateway_id = azurerm_virtual_network_gateway.example.id
  local_network_gateway_id   = azurerm_local_network_gateway.onpremise.id
  connection_protocol        = "IKEv2"

  shared_key = "${var.Sharedkey}"
}
