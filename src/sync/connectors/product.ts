import { BaseConnector, ConnectorResponse } from "./base";
import { prisma } from "../../config/prisma";
import crypto from "crypto";

export class ProductConnector extends BaseConnector {
  name = "Product_API";
  version = "1.0.0";

  async execute(companyId?: string): Promise<ConnectorResponse> {
    if (!companyId) return { success: false, message: "Company ID required" };
    
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return { success: false, message: "Company not found" };

    try {
      const mockPayload = {
        name: "Mock Product Alpha",
        slug: "mock-product-alpha-" + Date.now(),
        productUrl: "https://example.com/products/alpha",
        productType: "DRUG",
        status: "ACTIVE"
      };

      const checksum = crypto.createHash("sha256").update(JSON.stringify(mockPayload)).digest("hex");
      await this.saveStagingPayload("ProductAPI", "/api/v1/products", mockPayload, checksum);

      // Create Product
      await prisma.product.create({
        data: {
          name: mockPayload.name,
          slug: mockPayload.slug,
          productUrl: mockPayload.productUrl,
          productType: mockPayload.productType,
          status: mockPayload.status,
          companyId: company.id
        }
      });

      return { success: true, payload: mockPayload };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}
