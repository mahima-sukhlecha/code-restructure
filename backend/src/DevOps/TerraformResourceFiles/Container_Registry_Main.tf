resource "azurerm_resource_group" "rg" {
    name     = var.resource_group_name
    location = var.location
}

resource "azurerm_container_registry" "acr" {
  name                     = "${var.container_registery_name}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = "${var.container_registery_location}"
  sku                      = "${var.container_registery_sku}"
  admin_enabled            = "${var.Admin_Enable}"
  #georeplication_locations = ["East US", "West Europe"]
}
