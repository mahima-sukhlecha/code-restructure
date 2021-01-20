resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Name}"
  location = "${var.Location}"
}

  resource "azurerm_template_deployment" "example" {
    name                = "acctesttemplate-01"
    resource_group_name = azurerm_resource_group.example.name
   parameters = {

        "webAppName" = "${var.webAppName}"
        "webLocation" ="${var.webLocation}"
        "linuxFxVersion" ="${var.linuxFxVersion}"
      }
    template_body = <<DEPLOY
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "webAppName": {
      "type": "string",
      "defaultValue" : "AzureLpp123",
      "metadata": {
        "description": "Base name of the resource such as web app name and app service plan "
      },
      "minLength": 2
    },
    "sku":{
      "type": "string",
      "defaultValue" : "S1",
      "metadata": {
        "description": "The SKU of App Service Plan "
      }
    },

    "linuxFxVersion" : {
        "type": "string",
        "defaultValue" : "PHP|7.3",
        "metadata": {
          "description": "The Runtime stack of current web app"
        }
    },
    "webLocation": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]",
      "metadata": {
        "description": "Location for all resources."
      }
    }
  },
  "variables": {
    "webAppPortalName": "[parameters('webAppName')]",
    "appServicePlanName": "[concat('AppServicePlan-', parameters('webAppName'))]"
  },
  "resources": [
    {
      "type": "Microsoft.Web/serverfarms",
      "apiVersion": "2018-02-01",
      "name": "[variables('appServicePlanName')]",
      "location": "[parameters('webLocation')]",
      "sku": {
        "name": "[parameters('sku')]"
      },
      "kind": "linux",
      "properties":{
        "reserved":true
      }
    },
    {
      "type": "Microsoft.Web/sites",
      "apiVersion": "2018-11-01",
      "name": "[variables('webAppPortalName')]",
      "location": "[parameters('webLocation')]",
      "kind": "app",
      "dependsOn": [
        "[resourceId('Microsoft.Web/serverfarms', variables('appServicePlanName'))]"
      ],
      "properties": {
        "serverFarmId": "[resourceId('Microsoft.Web/serverfarms', variables('appServicePlanName'))]",
        "siteConfig": {
            "linuxFxVersion": "[parameters('linuxFxVersion')]"
          }
      }
    }
  ]
}
DEPLOY
deployment_mode = "Incremental"
}
