import { BaseConnector, ConnectorResponse } from "./base";
import { prisma } from "../../config/prisma";
import crypto from "crypto";

export class OpenFDAConnector extends BaseConnector {
  name = "OpenFDA_API_REAL";
  version = "2.0.0";

  async execute(companyId?: string): Promise<ConnectorResponse> {
    if (!companyId) return { success: false, message: "Company ID required" };
    
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return { success: false, message: "Company not found" };

    try {
      // 1. Fetch Commercial Products from NDC directory
      const url = `https://api.fda.gov/drug/ndc.json?search=openfda.manufacturer_name:"${encodeURIComponent(company.name)}"&limit=1000`;
      const response = await fetch(url);
      
      let resultsCount = 0;
      
      if (response.ok) {
        const payload = await response.json();
        const results = payload.results || [];
        
        for (const item of results) {
          const openfda = item.openfda || {};
          
          const brandName = openfda.brand_name?.[0] || item.brand_name || "Unknown Brand";
          const genericName = openfda.generic_name?.[0] || item.generic_name || "";
          
          // Deduplicate by NDC or name
          const ndcCode = item.product_ndc || null;
          const manufacturer = openfda.manufacturer_name?.[0] || item.labeler_name || null;
          
          let activeIngredients = item.active_ingredients?.map((a: any) => `${a.name} (${a.strength})`).join(", ") || "";
          if (!activeIngredients) activeIngredients = genericName;

          const therapeuticArea = openfda.pharm_class_epc?.[0] || openfda.pharm_class_pe?.[0] || null;
          const dosageForm = item.dosage_form || null;
          const route = item.route?.[0] || null;
          const approvalDate = item.marketing_start_date ? 
            `${item.marketing_start_date.substring(0,4)}-${item.marketing_start_date.substring(4,6)}-${item.marketing_start_date.substring(6,8)}` : null;
          const marketingStatus = item.marketing_category || "APPROVED";
          
          // Map to Product table
          const existingProduct = await prisma.product.findFirst({ 
            where: { name: brandName, companyId: company.id } 
          });
          
          const newProductData = {
            name: brandName,
            slug: encodeURIComponent(brandName.toLowerCase().replace(/ /g, "-")) + "-" + Date.now(),
            brandName: brandName,
            genericName: genericName,
            productType: "DRUG",
            description: activeIngredients,
            therapeuticArea: therapeuticArea,
            dosageForm: dosageForm,
            approvalStatus: marketingStatus,
            approvalDate: approvalDate,
            manufacturer: manufacturer,
            officialLink: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(brandName)}`,
            companyId: company.id
          };

          if (existingProduct) {
            await prisma.product.update({ 
              where: { id: existingProduct.id }, 
              data: {
                brandName: newProductData.brandName,
                genericName: newProductData.genericName,
                description: newProductData.description,
                therapeuticArea: newProductData.therapeuticArea,
                dosageForm: newProductData.dosageForm,
                approvalStatus: newProductData.approvalStatus,
                approvalDate: newProductData.approvalDate,
                manufacturer: newProductData.manufacturer
              } 
            });
          } else {
            await prisma.product.create({ 
              data: { id: crypto.randomUUID(), ...newProductData } 
            });
          }
          
          // Also sync to Drug table for relations
          const existingDrug = await prisma.drug.findFirst({
            where: { name: brandName, companyId: company.id }
          });
          
          let drugId = existingDrug?.id;
          
          if (existingDrug) {
            await prisma.drug.update({
              where: { id: existingDrug.id },
              data: {
                activeIngredient: genericName || activeIngredients,
                ndcCode: ndcCode
              }
            });
          } else {
            const newDrug = await prisma.drug.create({
              data: {
                id: crypto.randomUUID(),
                name: brandName,
                slug: newProductData.slug,
                activeIngredient: genericName || activeIngredients,
                ndcCode: ndcCode,
                companyId: company.id
              }
            });
            drugId = newDrug.id;
            
            // Create CompanyDrugRelation
            await prisma.companyDrugRelation.create({
              data: {
                companyId: company.id,
                drugId: drugId,
                role: "OWNS"
              }
            });
          }
        }
        
        resultsCount += results.length;
      }
      
      // 2. Fetch Regulatory Enforcement Reports (Recalls)
      const enfUrl = `https://api.fda.gov/drug/enforcement.json?search=recalling_firm:"${encodeURIComponent(company.name)}"&limit=100`;
      const enfResponse = await fetch(enfUrl);
      
      if (enfResponse.ok) {
        const enfPayload = await enfResponse.json();
        const enfResults = enfPayload.results || [];
        
        for (const item of enfResults) {
          const recallNumber = item.recall_number;
          if (!recallNumber) continue;
          
          const existing = await prisma.companyRegulatoryAction.findFirst({
            where: { companyId: company.id, title: recallNumber }
          });
          
          const issueDate = item.recall_initiation_date ? 
            new Date(`${item.recall_initiation_date.substring(0,4)}-${item.recall_initiation_date.substring(4,6)}-${item.recall_initiation_date.substring(6,8)}`) : new Date();
            
          const actionData = {
            agency: "FDA",
            type: "Recall",
            title: recallNumber,
            summary: item.reason_for_recall || item.product_description,
            issueDate: issueDate,
            severity: item.classification,
            companyId: company.id
          };
          
          if (!existing) {
            await prisma.companyRegulatoryAction.create({
              data: { id: crypto.randomUUID(), ...actionData }
            });
          }
        }
      }

      return { success: true, payload: { resultsCount } };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}
