resource "azurerm_resource_group" "WinRG" {
  name     = "${element(var.AppServiceWin_RG, count.index)}"
  location = "${element(var.AppServiceWin_RG_Location, count.index)}"
    count                 =  "${var.pythonappcount}"
    tags  = "${merge(map("${element(var.AppService_TagsKey-proj, count.index)}","${element(var.AppService_TagsValue-proj, count.index)}","${element(var.AppService_TagsKey-env, count.index)}", "${element(var.AppService_TagsValue-env, count.index)}"))}"

}

resource "azurerm_app_service_plan" "WinWebAppPlanPython" {
  name                = "${element(var.WINwebAppNamePython, count.index)}-ASP"
  location            = "${element(azurerm_resource_group.WinRG.*.location, count.index)}"
  resource_group_name = "${element(azurerm_resource_group.WinRG.*.name, count.index)}"
  kind                = "${element(var.Win_WebAppOS, count.index)}"
  reserved              = "${element(var.Win_osreserved, count.index)}"
  count                 =  "${var.pythonappcount}"

  sku {
    tier = "Standard"
    size = "S1"
  }
  tags  = "${merge(map("${element(var.AppService_TagsKey-proj, count.index)}","${element(var.AppService_TagsValue-proj, count.index)}","${element(var.AppService_TagsKey-env, count.index)}", "${element(var.AppService_TagsValue-env, count.index)}"))}"

}

resource "azurerm_app_service" "WINpython" {
  name                = "${element(var.WINwebAppNamePython, count.index)}"
  location            = "${element(azurerm_resource_group.WinRG.*.location, count.index)}"
  resource_group_name = "${element(azurerm_resource_group.WinRG.*.name, count.index)}"
  app_service_plan_id = "${element(azurerm_app_service_plan.WinWebAppPlanPython.*.id, count.index)}"
  count                = "${var.currentStack == "Python" ? 0 : var.pythonappcount }"

  site_config {
    #python_version           = "${var.currentStack == "Python"? 0 : var.pythonVersion}"
    #python_version           =   "${var.pythonVersion == "" ? 0 : "${element(var.pythonVersion, count.index)}"}"
    python_version           =   "${element(var.pythonVersion, count.index)}"
  }
tags  = "${merge(map("${element(var.AppService_TagsKey-proj, count.index)}","${element(var.AppService_TagsValue-proj, count.index)}","${element(var.AppService_TagsKey-env, count.index)}", "${element(var.AppService_TagsValue-env, count.index)}"))}"

}
resource "azurerm_app_service_plan" "WinWebAppPlanPhp" {
  name                = "${element(var.WINwebAppNamephp, count.index)}-ASP"
  location            = "${element(azurerm_resource_group.WinRG.*.location, count.index)}"
  resource_group_name = "${element(azurerm_resource_group.WinRG.*.name, count.index)}"
  kind                = "${element(var.Win_WebAppOS, count.index)}"
  reserved              = "${element(var.Win_osreserved, count.index)}"
  count                 =  "${var.phpappcount}"

  sku {
    tier = "Standard"
    size = "S1"
  }
      tags  = "${merge(map("${element(var.AppService_TagsKey-proj, count.index)}","${element(var.AppService_TagsValue-proj, count.index)}","${element(var.AppService_TagsKey-env, count.index)}", "${element(var.AppService_TagsValue-env, count.index)}"))}"

}
resource "azurerm_app_service" "WinPHP" {
  name                = "${element(var.WINwebAppNamephp, count.index)}"
  location            = "${element(azurerm_resource_group.WinRG.*.location, count.index)}"
  resource_group_name = "${element(azurerm_resource_group.WinRG.*.name, count.index)}"
  app_service_plan_id = "${element(azurerm_app_service_plan.WinWebAppPlanPhp.*.id, count.index)}"
  count               = "${var.currentStack == "PHP" ? 0 : var.phpappcount}"
  site_config {
    #php_version           = "${var.currentStack == "PHP" ?  0 : var.phpVersion}"
    #php_version           =   "${var.phpVersion == "7.2" ? 0 : "7.2"}"
    php_version           =   "${element(var.phpVersion, count.index)}"
  }
    tags  = "${merge(map("${element(var.AppService_TagsKey-proj, count.index)}","${element(var.AppService_TagsValue-proj, count.index)}","${element(var.AppService_TagsKey-env, count.index)}", "${element(var.AppService_TagsValue-env, count.index)}"))}"

}
#--------------------------------------linx web app------------------------------------------------------------#
resource "azurerm_resource_group" "LinuxRG" {
  name     = "${element(var.AppServiceLnx_RG, count.index)}"
  location = "${element(var.AppServiceLnx_RG_Location, count.index)}"
    count                 =  "${var.Lnx_AppServiceCount}"
    tags  = "${merge(map("${element(var.AppService_TagsKey-proj, count.index)}","${element(var.AppService_TagsValue-proj, count.index)}","${element(var.AppService_TagsKey-env, count.index)}", "${element(var.AppService_TagsValue-env, count.index)}"))}"

}

resource "azurerm_app_service_plan" "LNXwebappPlan" {
  name                = "${element(var.LnxwebAppName, count.index)}-ASP"
  location            = "${element(azurerm_resource_group.LinuxRG.*.location, count.index)}"
  resource_group_name = "${element(azurerm_resource_group.LinuxRG.*.name, count.index)}"
  kind                = "${element(var.LNX_WebAppOS, count.index)}"
  reserved              = "${element(var.LNX_osreserved, count.index)}"
  count                 =  "${var.Lnx_AppServiceCount}"

  sku {
    tier = "Standard"
    size = "S1"
  }
      tags  = "${merge(map("${element(var.AppService_TagsKey-proj, count.index)}","${element(var.AppService_TagsValue-proj, count.index)}","${element(var.AppService_TagsKey-env, count.index)}", "${element(var.AppService_TagsValue-env, count.index)}"))}"

}

resource "azurerm_app_service" "LNXwebapp" {
  name                = "${element(var.LnxwebAppName, count.index)}"
  location            = "${element(azurerm_resource_group.LinuxRG.*.location, count.index)}"
  resource_group_name = "${element(azurerm_resource_group.LinuxRG.*.name, count.index)}"
  app_service_plan_id = "${element(azurerm_app_service_plan.LNXwebappPlan.*.id, count.index)}"
  count                 = "${var.LNX_WebAppOS == "Linux" ?  0 : var.Lnx_AppServiceCount}"

  site_config {
        linux_fx_version = "${element(var.linuxfxversion, count.index)}"       
  }
      tags  = "${merge(map("${element(var.AppService_TagsKey-proj, count.index)}","${element(var.AppService_TagsValue-proj, count.index)}","${element(var.AppService_TagsKey-env, count.index)}", "${element(var.AppService_TagsValue-env, count.index)}"))}"

}
/*
resource "azurerm_app_service" "dotnet" {
  count                 = "${var.currentStack == "dotnet" ?  0 : var.dotnetappcount }"
  name                = "${element(var.webAppName, count.index)}"
  location            = "${element(azurerm_resource_group.main.*.location, count.index)}"
  resource_group_name = "${element(azurerm_resource_group.main.*.name, count.index)}"
  app_service_plan_id = "${element(azurerm_app_service_plan.main.*.id, count.index)}"

  site_config {
    #dotnet_framework_version    = "${currentStack == "dotnet" ? v4.0 : v2.0 }"
    dotnet_framework_version    = "${var.dotnetVersion == "v4.0" ? "v4.0" : "${element(var.dotnetVersion, count.index)}"}"

  }
}

resource "azurerm_app_service" "java" {
  count                 = "${var.currentStack == "java" ?  0 : var.appservicecount }"
  name                = "${element(var.webAppName, count.index)}"
  location            = "${element(azurerm_resource_group.main.*.location, count.index)}"
  resource_group_name = "${element(azurerm_resource_group.main.*.name, count.index)}"
  app_service_plan_id = "${element(azurerm_app_service_plan.main.*.id, count.index)}"

  site_config {
    #java_version           = "${var.currentStack == "java"? 0 : var.javaVersion}"
    java_version           = "${var.javaVersion == ""? 0 : var.javaVersion}"
      java_container         = "JETTY"
    java_container_version   = "9.3"
  }
}

*/