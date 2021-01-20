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

  type     = "ExpressRoute"
  #vpn_type = "ExpressRoute"

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
resource "azurerm_express_route_circuit" "example" {
  name                  = "${var.ExpressRoute-Name}"
  resource_group_name   = azurerm_resource_group.example.name
  location              = azurerm_resource_group.example.location
  service_provider_name = "${var.ServiceProvider-Name}"
  peering_location      = "${var.Peering-Location}"
  bandwidth_in_mbps     = "${var.Bandwidth}"

  sku {
    tier   = "${var.ExpressRoute-SKU}"
    family = "${var.Billing-Model}"
  }

  
}