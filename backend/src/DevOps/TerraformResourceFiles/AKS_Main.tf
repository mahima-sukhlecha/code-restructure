resource "azurerm_resource_group" "k8s" {
    name     = var.resource_group_name
    location = var.location
}

resource "azurerm_log_analytics_workspace" "test" {
    # The WorkSpace name has to be unique across the whole of azure, not just the current subscription/tenant.
    name                = "${var.log_analytics_workspace_name}"
    location            = var.log_analytics_workspace_location
    resource_group_name = azurerm_resource_group.k8s.name
    sku                 = var.log_analytics_workspace_sku
}

resource "azurerm_log_analytics_solution" "test" {
    solution_name         = "ContainerInsights"
    location              = azurerm_log_analytics_workspace.test.location
    resource_group_name   = azurerm_resource_group.k8s.name
    workspace_resource_id = azurerm_log_analytics_workspace.test.id
    workspace_name        = azurerm_log_analytics_workspace.test.name

    plan {
        publisher = "Microsoft"
        product   = "OMSGallery/ContainerInsights"
    }
}

resource "azurerm_virtual_network" "example" {
  name                = "${var.VirtualNetwork-Name}"
  resource_group_name = azurerm_resource_group.k8s.name
  address_space       = ["${var.VirtualNetwork-AddressSapce}"]
  location            = "${var.AKSCluster-Loaction}"
}
resource "azurerm_subnet" "default" {
  name                 = "${var.Subnet-Name}"
  resource_group_name  = azurerm_resource_group.k8s.name
  virtual_network_name = azurerm_virtual_network.example.name
  address_prefix       = "${var.Subnet-AdressSpace-default}"
}

resource "azurerm_kubernetes_cluster" "k8s" {
    name                = var.cluster_name
    location            = "${var.AKSCluster-Loaction}"
    resource_group_name = azurerm_resource_group.k8s.name
    dns_prefix          = var.dns_prefixName

    linux_profile {
        admin_username = "${var.Linux_Admin_Username}"

        ssh_key {
            key_data = var.ssh_public_key
        }
    }

    default_node_pool {
        name       = "default"
        node_count = "${var.node_count_default_pool}"
        vm_size    = "${var.vm_size_default_pool}"
        type       = "VirtualMachineScaleSets"
        vnet_subnet_id = azurerm_subnet.default.id
    }
      network_profile {
    network_plugin     = "azure"
    network_policy     = "azure"     
    dns_service_ip     = "${var.AKS-DNS_service_ip}" 
    docker_bridge_cidr = "${var.docker_bridge_cidr}"
    service_cidr       = "${var.AKS-Service_cidr}"
  }

    service_principal {
        client_id     = var.client_id
        client_secret = var.client_secret
    }

    role_based_access_control {
        enabled       = true
    }

    addon_profile {
        oms_agent {
        enabled                    = true
            log_analytics_workspace_id = azurerm_log_analytics_workspace.test.id
        }
    }
}
resource "azurerm_kubernetes_cluster_node_pool" "examplewindows" {
#count          = 2 
 count 			= "${var.extranodeswindows == true ? 1:0 }"
  name                  = "inte"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.k8s.id
  vm_size               = "${var.vm_size_extranode_pool}"
  node_count            = "${var.node_count_extranode_pool}"
    os_type         = "Windows"
        vnet_subnet_id = azurerm_subnet.default.id

  

}
resource "azurerm_kubernetes_cluster_node_pool" "exampleLinux" {
 count 			= "${var.extranodeswindows == false ? 1:0 }"
  name                  = "internal"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.k8s.id
  vm_size               = "${var.vm_size_extranode_pool}"
  node_count            = "${var.node_count_extranode_pool}"
        vnet_subnet_id = azurerm_subnet.default.id

  }