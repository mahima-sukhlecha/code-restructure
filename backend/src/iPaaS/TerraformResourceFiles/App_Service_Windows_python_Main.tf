
resource "azurerm_resource_group" "RG" {
  name     = "${var.Resource_Name}"
  location = "${var.Location}"
}

  resource "azurerm_template_deployment" "RG" {
    name                = "acctesttemplate-01"
    resource_group_name = azurerm_resource_group.RG.name
    parameters = {

        "webAppName" = "${var.webAppName}"
        "webLocation" ="${var.webLocation}"
        "currentStack" ="${var.currentStack}"
        "Version" ="${var.Version}"

      }
    template_body = <<DEPLOY

{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "webAppName": {
      "type": "string",
            "defaultValue" : "dd788",

      "metadata": {
        "description": "Base name of the resource such as web app name and app service plan"
      },
      "minLength": 2
    },
    "sku":{
      "type": "string",
      "defaultValue" : "S1",
      "metadata": {
        "description": "The SKU of App Service Plan, by default is Standard S1"
      }
    },
    "webLocation": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]",
      "metadata": {
        "description": "Location for all resources"
      }
    },
     "currentStack": {
            "type": "string",
            "defaultValue" : "python"

        },
        "Version": {
          "type": "string",
          "defaultValue" : "3.4"

        },
        "alwaysOn": {
           "type": "bool",
            "defaultvalue": true
        }
  },
  "variables": {
    "webAppPortalName": "[parameters('webAppName')]",
    "appServicePlanName": "[concat('AppServicePlan-', parameters('webAppName'))]"
  },
  "resources": [
    {
      "apiVersion": "2018-02-01",
      "type": "Microsoft.Web/serverfarms",
      "kind": "app",
      "name": "[variables('appServicePlanName')]",
      "location": "[parameters('webLocation')]",
      "properties": {},
      "dependsOn": [],
      "sku": {
        "name": "[parameters('sku')]"
      }
    },
    {
      "apiVersion": "2018-11-01",
      "type": "Microsoft.Web/sites",
      "kind": "app",
      "name": "[variables('webAppPortalName')]",
      "location": "[parameters('webLocation')]",

        "properties": {
                "name": "[parameters('webAppName')]",
                "siteConfig": {
                    "appSettings": [
                        {
                            "name": "WEBSITE_NODE_DEFAULT_VERSION",
                            "value": "[parameters('Version')]"
                        }
                    ],
                    "metadata": [
                        {
                            "name": "CURRENT_STACK",
                            "value": "[parameters('currentStack')]"
                        }
                    ],
                    "pythonVersion": "[parameters('Version')]",
                    "alwaysOn": "[parameters('alwaysOn')]"
                },
        "serverFarmId": "[resourceId('Microsoft.Web/serverfarms', variables('appServicePlanName'))]"
      },
      "dependsOn": [
        "[resourceId('Microsoft.Web/serverfarms', variables('appServicePlanName'))]"
      ]
    }
  ]
}
  DEPLOY
deployment_mode = "Incremental"
}
