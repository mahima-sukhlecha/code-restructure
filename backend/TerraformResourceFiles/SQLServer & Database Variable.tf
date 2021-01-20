provider "azurerm" { 
 subscription_id    = "9f6f7208-62b5-44d2-8081-d472d00b6332"
 client_id       = "e1456d9f-8f5d-4b56-8d3a-7d36c9c7d28a"
 client_secret   = "lO?fK@2vL26-g.bFnVGPqOsffzGWfkH5"
 tenant_id       = "e4e34038-ea1f-4882-b6e8-ccd776459ca0"

}
variable "Resource_Group" {
  type ="string"
  default = "testing"
}
variable "location" {
  type = "string"
  default = "Central US"
  
}


#SQL Server Details
variable "ServerName" {
  type ="string"
  default = "newtesting123"
}
variable "SQLLocation" {
  type ="string"
  default = "East US"
}
variable "AdministratorUserName" {
  type ="string"
  default = "celebal"
}
variable "AdministratorPassword" {
  type ="string"
  default = "password@123"
}

variable "DataBaseName" {
  type ="string"
  default = "testing5678"
}
variable "SkuTier" {
  type ="string"
  default = "GeneralPurpose"
}

variable "SkuName" {
  type ="string"
  default = "GP_Gen5_2"
}