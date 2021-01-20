resource "azurerm_resource_group" "RG" {
  name     = "${var.Resource_Group}"
  location = "${var.Location}"
}
resource "azurerm_application_insights" "AI" {
  name                = "${var.Function_App_name}-ai"
  location            = "${var.functionapp_Location}"
  resource_group_name = "${azurerm_resource_group.RG.name}"
  application_type    = "web"
}

output "instrumentation_key" {
  value = "${azurerm_application_insights.AI.instrumentation_key}"
}

output "app_id" {
  value = "${azurerm_application_insights.AI.app_id}"
}

resource "azurerm_storage_account" "FunctionApp-StorageAccount" {
  name                     = "${var.Function_App_name}sca"
  resource_group_name      = "${azurerm_resource_group.RG.name}"
  location                 = "${var.functionapp_Location}"
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_app_service_plan" "Service-Plan" {
  name                = "${var.Function_App_name}-plan"
  location            = "${var.functionapp_Location}"
  resource_group_name = "${azurerm_resource_group.RG.name}"
  kind                = "${var.kind}"
  reserved = "${var.reserved}"

  sku {
    tier = "${var.SKU}"
    size = "${var.Size_App_Service_Plan}"
  }
}

resource "azurerm_function_app" "Function-App" {
  name                      = "${var.Function_App_name}"
  location                  = "${var.functionapp_Location}"
  resource_group_name       = "${azurerm_resource_group.RG.name}"
  app_service_plan_id       = "${azurerm_app_service_plan.Service-Plan.id}"
  storage_connection_string = azurerm_storage_account.FunctionApp-StorageAccount.primary_connection_string
 	app_settings = {
       APPINSIGHTS_INSTRUMENTATIONKEY = "${azurerm_application_insights.AI.instrumentation_key}"
        https_only = true
        FUNCTIONS_WORKER_RUNTIME = "${var.FUNCTIONS_WORKER_RUNTIME}"
        WEBSITE_NODE_DEFAULT_VERSION = "~10"
    }

}
