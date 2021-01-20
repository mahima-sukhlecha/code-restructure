provider "azurerm" { 
 subscription_id    = "9f6f7208-62b5-44d2-8081-d472d00b6332"
 client_id       = "e1456d9f-8f5d-4b56-8d3a-7d36c9c7d28a"
 client_secret   = "lO?fK@2vL26-g.bFnVGPqOsffzGWfkH5"
 tenant_id       = "e4e34038-ea1f-4882-b6e8-ccd776459ca0"

}
variable "Resource_Group" {
  type ="string"
  default = "testing1234"
}
variable "location" {
  type = "string"
  default = "Central US"
  
}
variable "virtual_network_Location"{
    type ="string"
  default = "Central US"
}
variable "virtual_network_Name"{
    type ="string"
    default ="a3svnet"
}
variable "virtual_network_addresssapce"{
    type ="string"
    default ="10.0.0.0/16"
}
variable "subnet_name" {
  type ="string"
default ="default"
}
variable "subnet_addresssapce"{
    type ="string"
    default ="10.0.0.0/24"
}
  variable "VM_Name_SQL"{
      type = "string"
      default = "a3sVM"
  }
variable "virtual_Machine_Location"{
    type ="string"
  default = "Central US"
}
variable "Virtual_Machine_Size"{
    type ="string"
  default = "Standard_DS1_v2"
}
variable "Image_publisher"{
    type ="string"
  default = "MicrosoftSQLServer"
}

variable "image_offer"{
    type ="string"
  default = "SQL2017-WS2016"
}

variable "Image_Sku"{
    type ="string"
  default = "Web"
}
variable "VM_ComputerName"{
    type ="string"
  default = "hostname"
}

variable "VM_UserName"{
    type ="string"
  default = "celebal"
}

variable "VM_Password"{
    type ="string"
  default = "password@123"
}

