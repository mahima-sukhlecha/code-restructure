resource "azurerm_resource_group" "example" {
    name     = "${var.Resource_Group}"
    location = "${var.location}"
}

resource "azurerm_container_group" "example" {
  name                = "${var.Conatiner-Instance-Name}"
  location            = "${var.Conatiner-Instance-location}"
  resource_group_name = azurerm_resource_group.example.name
  ip_address_type     = "public"
  dns_name_label      = "${var.DNS-Name}"
  os_type             = "${var.OS-type}"

  container {
    name   = "${var.Conatiner-Name}"
    image  = "${var.Conatiner-Image}"
    cpu    = "${var.CPU}"
    memory = "${var.Memory}"

    ports {
      port     = "${var.Port-number}"
      protocol = "${var.Protocol}"
    }
  }

  tags = {
    environment = "testing"
  }
}
