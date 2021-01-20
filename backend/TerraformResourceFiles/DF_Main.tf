resource "azurerm_resource_group" "example" {
  name     = "${var.Resource_Group}"
  location = "${var.location}"
}

resource "azurerm_template_deployment" "example" {
  name                = "acctesttemplate-03"
  resource_group_name = azurerm_resource_group.example.name
parameters = {
        "DataFactoryName" ="${var.DataFactoryName}"
        "DataFactoryLocation" ="${var.DataFactoryLocation}"
      }
  template_body = <<DEPLOY

{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "DataFactoryName": {
      "type": "string",
      "metadata": {
        "description": "The name of the data factory."
      }
    },
    "DataFactoryLocation": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]",
      "metadata": {
        "description": "Location of all resources."
      }
    }
  },
    "variables": {
            "integrationrt": "integrationRuntime1"

    },
      "resources": [
     {
      "type": "Microsoft.DataFactory/factories",
      "apiVersion": "2018-06-01",
      "name": "[parameters('DataFactoryName')]",
      "location": "[parameters('DataFactoryLocation')]",
      "identity": {
          "type": "SystemAssigned"
      },
      "resources": [
          {
              "type": "integrationRuntimes",
              "apiVersion": "2018-06-01",
              "name": "[variables('integrationrt')]",
              "dependsOn": [
                  "[resourceId('Microsoft.DataFactory/factories',parameters('DataFactoryName'))]"
              ],
              "properties": {
                  "type": "SelfHosted",
                  "typeProperties": {}
              }
          }
      ]
  }
      ]
}
 DEPLOY


  deployment_mode = "Incremental"
} 