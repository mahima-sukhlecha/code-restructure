provider "azurerm" { 
 subscription_id    = "9f6f7208-62b5-44d2-8081-d472d00b6332"
 client_id       = "e1456d9f-8f5d-4b56-8d3a-7d36c9c7d28a"
 client_secret   = "lO?fK@2vL26-g.bFnVGPqOsffzGWfkH5"
 tenant_id       = "e4e34038-ea1f-4882-b6e8-ccd776459ca0"
}
variable resource_group_name {
    default = "azure-k8stest1324"
}

variable location {
    default = "West Europe"
}


variable "AKSCluster-Loaction" {
    type ="string"
    default = "West US"
  
}

 variable "AKS-DNS_service_ip" { 
type = "string"
 default = "172.16.0.10" 
 }
variable "docker_bridge_cidr"{
type = "string"
default ="172.17.0.1/16"
    }
variable "AKS-Service_cidr"{
type = "string"
default ="172.16.0.0/16"
    }
variable "client_id" {
type = "string"
default = "e1456d9f-8f5d-4b56-8d3a-7d36c9c7d28a"
}
variable "client_secret" {
    default = "lO?fK@2vL26-g.bFnVGPqOsffzGWfkH5"
}

variable "node_count_default_pool" {
    default = 3
}
variable "vm_size_default_pool" {
    default = "Standard_B2s"
}

variable "node_count_extranode_pool" {
    default = 3
}
variable "vm_size_extranode_pool" {
    default = "Standard_B2s"
}
variable "Linux_Admin_Username" {
    default = "celebal"
}
variable "ssh_public_key" {
    default ="ssh-rsa AAAAB3NzaC1yc2EAAAABJQAAAQEAsSd9s4OJHbgvnsnIz7mjORkRvMGnK98I4LPzx56U3hRFeXf6TMPYqkAUefZxAuBORyrZqCdIkHMhyiTLKMLpCOfxBRKTyM/FnH6o/4U3yOPvOXdT/XAQ9pEPFjgI1BEq4qKygdC0TE3XI9sYbE93vBd1zf+we+tSdwI0jqT2fPJrThlZwoX0QWEAN4edl1Bd2YTUf2/YgLyEum3FMhz9oZzNRlbQk9AyL45ZAg67JYrEWBujMWx83/yU0kq5hIGkc6sTSKQtYuPgOE3Gwzprd09Kptp3VRZIBWvR6kZoWsxp08GOI7OXLIATL8IT7UsojuBC6l5+lDxIWSUdJpgNVQ== rsa-key-20200413"

}
variable "extranodeswindows" {
    default = true
}

variable "windows_Admin_Username" {
    default = "celebal"
}
variable "Windows_Password" {
    default = "password@123"
}
variable "dns_prefixName" {
    default = "k8stest"
}

variable cluster_name {
    default = "k8stest"
}

variable log_analytics_workspace_name {
    default = "testLogAnalyticsWorkspaceName77678"
}

# refer https://azure.microsoft.com/global-infrastructure/services/?products=monitor for log analytics available regions
variable log_analytics_workspace_location {
    default = "westeurope"
}

# refer https://azure.microsoft.com/pricing/details/monitor/ for log analytics pricing
variable log_analytics_workspace_sku {
    default = "PerGB2018"
}