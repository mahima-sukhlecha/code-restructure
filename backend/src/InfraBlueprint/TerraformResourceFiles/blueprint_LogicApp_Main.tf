resource "azurerm_resource_group" "logic_RG" {
  name     = "${element(var.LogicApp_Resource_Name, count.index)}"
  location = "${element(var.logicAppRG_Location, count.index)}"
  count    = "${var.LogicAppCount}"
    tags  = "${merge(map("${element(var.Logicapp_TagsKey-proj, count.index)}","${element(var.LogicApp_TagsValue-proj, count.index)}","${element(var.Logicapp_TagsKey-env, count.index)}", "${element(var.LogicApp_TagsValue-env, count.index)}"))}"

}

resource "azurerm_logic_app_workflow" "LogicApp" {
    count    = "${var.LogicAppCount}"
  name                = "${element(var.Logic-App, count.index)}"
  location            = "${element(var.LogicApp-Location, count.index)}"
  resource_group_name = "${element(azurerm_resource_group.logic_RG.*.name, count.index)}"
    tags  = "${merge(map("${element(var.Logicapp_TagsKey-proj, count.index)}","${element(var.LogicApp_TagsValue-proj, count.index)}","${element(var.Logicapp_TagsKey-env, count.index)}", "${element(var.LogicApp_TagsValue-env, count.index)}"))}"

}
