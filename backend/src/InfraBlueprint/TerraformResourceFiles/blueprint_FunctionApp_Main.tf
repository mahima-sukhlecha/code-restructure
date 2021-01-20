resource "azurerm_resource_group" "funcAppRG" {
  name     = "${element(var.FunctApp_Resource_Group, count.index)}"
  location = "${element(var.FunctApp_RG_Location, count.index)}"
  count    = "${var.FunctioAppCount}"
  tags  = "${merge(map("${element(var.FunctionApp_TagsKey-proj, count.index)}","${element(var.FunctionApp_TagsValue-proj, count.index)}","${element(var.FunctionApp_TagsKey-env, count.index)}", "${element(var.FunctionApp_TagsValue-env, count.index)}"))}"
}

resource "azurerm_application_insights" "AI" {
  name                = "${element(var.Function_App_name, count.index)}-ai"
  location            = "${element(var.functionapp_Location, count.index)}"
  resource_group_name = "${element(azurerm_resource_group.funcAppRG.*.name, count.index)}"
  application_type    = "web"
    count    = "${var.FunctioAppCount}"
  tags  = "${merge(map("${element(var.FunctionApp_TagsKey-proj, count.index)}","${element(var.FunctionApp_TagsValue-proj, count.index)}","${element(var.FunctionApp_TagsKey-env, count.index)}", "${element(var.FunctionApp_TagsValue-env, count.index)}"))}"
}
/*
output "instrumentation_key" {
  value = "${azurerm_application_insights.AI.instrumentation_key}"
}

output "app_id" {
  value = "${azurerm_application_insights.AI.app_id}"
}
*/
resource "azurerm_storage_account" "FunctionApp-StorageAccount" {
  name                     = "${element(var.Function_App_name, count.index)}sca"
  resource_group_name      = "${element(azurerm_resource_group.funcAppRG.*.name, count.index)}"
  location                 = "${element(var.functionapp_Location, count.index)}"
  account_tier             = "Standard"
  account_replication_type = "LRS"
 count    = "${var.FunctioAppCount}"
  tags  = "${merge(map("${element(var.FunctionApp_TagsKey-proj, count.index)}","${element(var.FunctionApp_TagsValue-proj, count.index)}","${element(var.FunctionApp_TagsKey-env, count.index)}", "${element(var.FunctionApp_TagsValue-env, count.index)}"))}"
}

resource "azurerm_app_service_plan" "Service-Plan" {
  name                = "${element(var.Function_App_name, count.index)}-plan"
  location            = "${element(var.functionapp_Location, count.index)}"
  resource_group_name      = "${element(azurerm_resource_group.funcAppRG.*.name, count.index)}"
  kind                = "${element(var.kind, count.index)}"
  reserved = "${element(var.reserved, count.index)}"
   count    = "${var.FunctioAppCount}"

  sku {
    tier = "${element(var.SKU, count.index)}"
    size = "${element(var.Size_App_Service_Plan, count.index)}"
  }
  tags  = "${merge(map("${element(var.FunctionApp_TagsKey-proj, count.index)}","${element(var.FunctionApp_TagsValue-proj, count.index)}","${element(var.FunctionApp_TagsKey-env, count.index)}", "${element(var.FunctionApp_TagsValue-env, count.index)}"))}"
}

resource "azurerm_function_app" "Function-App" {
  name                      = "${element(var.Function_App_name, count.index)}"
  location                  = "${element(var.functionapp_Location, count.index)}"
  resource_group_name      = "${element(azurerm_resource_group.funcAppRG.*.name, count.index)}"
  app_service_plan_id       = "${element(azurerm_app_service_plan.Service-Plan.*.id, count.index)}"
 storage_connection_string  = "${element(azurerm_storage_account.FunctionApp-StorageAccount.*.primary_connection_string, count.index)}"
 	#storage_connection_string  =  "${element(var.strorageconnectionstring, count.index)}"
   count    = "${var.FunctioAppCount}"
   app_settings = {
        name                      = "${element(var.Function_App_name, count.index)}"
        #count    = "${var.FunctioAppCount}"
        APPINSIGHTS_INSTRUMENTATIONKEY = "${element(azurerm_application_insights.AI.*.instrumentation_key, count.index)}"
        https_only = true
        FUNCTIONS_WORKER_RUNTIME = "${element(var.FUNCTIONS_WORKER_RUNTIME, count.index)}"
        WEBSITE_NODE_DEFAULT_VERSION = "~10"
    }
  tags  = "${merge(map("${element(var.FunctionApp_TagsKey-proj, count.index)}","${element(var.FunctionApp_TagsValue-proj, count.index)}","${element(var.FunctionApp_TagsKey-env, count.index)}", "${element(var.FunctionApp_TagsValue-env, count.index)}"))}"
}
