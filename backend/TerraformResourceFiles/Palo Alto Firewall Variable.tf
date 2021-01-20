provider "azurerm" { 
 subscription_id    = "9545d130-4dd6-4ce7-a092-8d05ee969804"
 client_id       = "e1456d9f-8f5d-4b56-8d3a-7d36c9c7d28a"
 client_secret   = "lO?fK@2vL26-g.bFnVGPqOsffzGWfkH5"
 tenant_id       = "e4e34038-ea1f-4882-b6e8-ccd776459ca0"
}
variable "resource_group_name" {
    type  = "string"
    default = "PAN-RG"
}
variable "location" {
    type = "string"
    default = "East Asia"
}

variable "StorageAccountName" {
    type = "string"
    default="pansca"
}
variable "FirewallDnsName" {
    type = "string"
    default = "pancelebal"
}
variable "FirewallVmName" {
    type = "string"
    default = "testingpan"
}
variable "FirewallVmSize" {
    type = "string"
    default = "Standard_D3_v2"
    }
variable "FromGatewayLogin" {
    type = "string"
    default = "0.0.0.0/0"
}

variable "storageAccountType" {
  default = "Standard_LRS"
}

variable "fwpublicIPName" {
  default = "fwPublicIP"
}

variable "publicIPAddressType" {
  default = "Dynamic"
}

variable "WebPublicIPName" {
  default = "WebPublicIP"
}

variable "VirtualNetworkName" {
  default = "palo-alto-Vnet"
}
variable "VirtualNetworkAddressSapace" {
    type ="list"
  default = ["10.0.0.0/16"]
}
variable "SubnetName1" {
  default = "Mgmt"
}
variable "SubnetAddressPrefix1" {
  default = "10.0.1.0/24"
}
variable "subnetName2" {
  default = "Untrust"
}
variable "SubnetAddressPrefix2" {
  default = "10.0.2.0/24"
}
variable "SubnetName3" {
  default = "Trust"
}
variable "SubnetAddressPrefix3" {
  default = "10.0.3.0/24"
}

# Note internally there is an assumption
# for the two NSG to have the same name!

variable "fwSku" {
  default = "byol"
}
variable "FWVersion" {
  default = "latest"
}
variable "fwOffer" {
  default = "vmseries1"
}

variable "fwPublisher" {
  default = "paloaltonetworks"
}

variable "adminUsername" {
  default = "paloalto"
}

variable "adminPassword" {
  default = "Pal0Alt0@123"
}


variable "imagePublisher" {
  default = "Canonical"
}

variable "imageOffer" {
  default = "UbuntuServer"
}

variable "ubuntuOSVersion" {
  default = "16.04-LTS"
}