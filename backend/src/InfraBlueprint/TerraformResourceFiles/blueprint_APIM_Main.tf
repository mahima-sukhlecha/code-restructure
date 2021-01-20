
resource "azurerm_resource_group" "RG_APIM" {
  name     = "${element(var.APIM_Resource_Group, count.index)}"
  location = "${element(var.APIM_RG_location, count .index)}"
  count     = "${var.APIMCount}"
    tags  = "${merge(map("${element(var.APIM_TagsKey-proj, count.index)}","${element(var.APIM_TagsValue-proj, count.index)}","${element(var.APIM_TagsKey-env, count.index+1)}", "${element(var.APIM_TagsValue-env, count.index+1)}"))}"
}

resource "azurerm_api_management" "APIM" {
  count     =           "${var.APIMCount}"
  name                = "${element(var.APIM-Name, count.index)}"
  location            = "${element(var.APIM-Location, count.index)}"
  depends_on =         ["azurerm_resource_group.RG_APIM"]
resource_group_name =  "${element(var.APIM_Resource_Group, count.index)}"
  publisher_name      = "${element(var.Publisher_Name, count.index)}"
  publisher_email     = "${element(var.Publisher_Email, count.index)}"
sku_name = "${element(var.sku, count.index)}"
    tags  = "${merge(map("${element(var.APIM_TagsKey-proj, count.index)}","${element(var.APIM_TagsValue-proj, count.index)}","${element(var.APIM_TagsKey-env, count.index+1)}", "${element(var.APIM_TagsValue-env, count.index+1)}"))}"

}

 
