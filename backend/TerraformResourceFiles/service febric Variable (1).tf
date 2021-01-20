provider "azurerm" { 
 subscription_id    = "9f6f7208-62b5-44d2-8081-d472d00b6332"
 client_id       = "e1456d9f-8f5d-4b56-8d3a-7d36c9c7d28a"
 client_secret   = "lO?fK@2vL26-g.bFnVGPqOsffzGWfkH5"
 tenant_id       = "e4e34038-ea1f-4882-b6e8-ccd776459ca0"

}
variable  "Resource_Group" {
    default = "azure-k8stest164"
}

variable "location" {
    default = "West Europe"
}

variable "VirtualNetwork-Name" {
  type ="string"
  default = "p2svnetr"
}
variable "VirtualNetwork-AddressSapce" {
  type ="string"
  default = "10.0.0.0/16"
}

variable "Subnet-Name" {
  type = "string"
  default = "default"
  
}
variable "Subnet-AdressSpace-default" {
  type = "string"
  default = "10.0.2.0/24"
  
}
variable "clusterName" {
  type    = "string"
  default = "sftrevor"
}
variable "clusterloaction" {
  type    = "string"
  default = "East US"
}
variable "adminUsername" {
    type    = "string"
default = "celebal"
}
variable "adminPassword" {
  type    = "string"
default = "celebal@12345"
}
variable "vmImageOffer" {
  type    = "string"
  default = "WindowsServerSemiAnnual"
}

variable "vmImageSku" {
    type    = "string"
  default = "Datacenter-Core-1709"
}
variable "certificateThumbprint" {
    type    = "string"
  default = "E70C92D3E4EB46E389C6DE1694176D7D2B88E4E9"
}
variable "certificateUrlValue" {
    type    = "string"
  default = "https://cdwcdrv.vault.azure.net/secrets/qdhi2ehud/75b5d863004d4e56bc84caff1780d375"
}
variable "KeyVaultResourceId" {
    type    = "string"
  default = "/subscriptions/9f6f7208-62b5-44d2-8081-d472d00b6332/resourceGroups/NetworkWatcherRG/providers/Microsoft.KeyVault/vaults/cdwcdrv"
}
variable "nt0InstanceCount" {
    type    = "string"
  default = "5"
}

variable "nodeTypeSize" {
    type    = "string"
  default = "Standard_D2_v2"
}
variable "durabilityLevel" {
    type    = "string"
  default = "Bronze"
}
