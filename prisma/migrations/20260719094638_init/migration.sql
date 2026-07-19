-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "roleId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayPriority" INTEGER NOT NULL DEFAULT 0,
    "tier" INTEGER,
    "completenessScore" REAL,
    "dataSources" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "countryId" TEXT,
    "stateId" TEXT,
    "cityId" TEXT,
    "lei" TEXT,
    "cik" TEXT,
    "rorId" TEXT,
    "wikidataId" TEXT,
    "openCorpId" TEXT,
    "rawApiData" TEXT,
    "provenance" TEXT,
    "lastSyncSuccess" DATETIME,
    "lastSyncFailure" DATETIME,
    "errorMessage" TEXT,
    "history" TEXT,
    "businessOverview" TEXT,
    "therapeuticAreas" TEXT,
    "businessModel" TEXT,
    "keyProducts" TEXT,
    "researchFocus" TEXT,
    "manufacturing" TEXT,
    "geographicPresence" TEXT,
    "regulatoryFootprint" TEXT,
    "technologyPlatforms" TEXT,
    "businessSegments" TEXT,
    "marketsServed" TEXT,
    "customers" TEXT,
    "recentMilestones" TEXT,
    "recentAcquisitions" TEXT,
    "recentApprovals" TEXT,
    "recentPartnerships" TEXT,
    "corporateHighlights" TEXT,
    "legalName" TEXT,
    "tradeName" TEXT,
    "parentCompany" TEXT,
    "ownershipType" TEXT,
    "incorporationDate" TEXT,
    "companyNumber" TEXT,
    "isin" TEXT,
    "duns" TEXT,
    "registeredAddress" TEXT,
    "manufacturingLocs" TEXT,
    "rdCenters" TEXT,
    "globalOffices" TEXT,
    "countriesServed" TEXT,
    "marketCap" TEXT,
    "funding" TEXT,
    "profit" TEXT,
    "employeeGrowth" TEXT,
    "stockPrice" TEXT,
    "latestSecFiling" TEXT,
    "enterpriseValue" TEXT,
    "netIncome" TEXT,
    "ebitda" TEXT,
    "operatingIncome" TEXT,
    "cash" TEXT,
    "assets" TEXT,
    "liabilities" TEXT,
    "equity" TEXT,
    "debt" TEXT,
    "freeCashFlow" TEXT,
    "eps" TEXT,
    "peRatio" TEXT,
    "sharesOutstanding" TEXT,
    "fiftyTwoWeekHigh" TEXT,
    "fiftyTwoWeekLow" TEXT,
    "dividend" TEXT,
    "fiscalYear" TEXT,
    "reportingDate" TEXT,
    "rdSpend" TEXT,
    "foundedYear" TEXT,
    "employees" TEXT,
    "revenue" TEXT,
    "hqAddress" TEXT,
    "ceo" TEXT,
    "stockExchange" TEXT,
    "jurisdiction" TEXT,
    "ticker" TEXT,
    "aboutDescription" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "specializations" TEXT,
    "founder" TEXT,
    "currency" TEXT,
    "socialLinkedin" TEXT,
    "socialTwitter" TEXT,
    "socialFacebook" TEXT,
    "socialYoutube" TEXT,
    "aliases" TEXT,
    "keywords" TEXT,
    "searchText" TEXT,
    "deletedAt" DATETIME,
    "formerNames" TEXT,
    "cusip" TEXT,
    "naics" TEXT,
    "sic" TEXT,
    "registrationNumbers" TEXT,
    "companyType" TEXT,
    "values" TEXT,
    "tagline" TEXT,
    "careersUrl" TEXT,
    "investorRelationsUrl" TEXT,
    "bannerUrl" TEXT,
    "videoUrl" TEXT,
    "operatingSegments" TEXT,
    "technologies" TEXT,
    "serviceCategories" TEXT,
    "manufacturingCapabilities" TEXT,
    "distributionCapabilities" TEXT,
    "researchCapabilities" TEXT,
    "activeTrialsCount" INTEGER NOT NULL DEFAULT 0,
    "totalTrialsCount" INTEGER NOT NULL DEFAULT 0,
    "completedTrialsCount" INTEGER NOT NULL DEFAULT 0,
    "registeredTrialsCount" INTEGER NOT NULL DEFAULT 0,
    "withdrawnTrialsCount" INTEGER NOT NULL DEFAULT 0,
    "recruitingTrialsCount" INTEGER NOT NULL DEFAULT 0,
    "suspendedTrialsCount" INTEGER NOT NULL DEFAULT 0,
    "terminatedTrialsCount" INTEGER NOT NULL DEFAULT 0,
    "phase1TrialsCount" INTEGER NOT NULL DEFAULT 0,
    "phase2TrialsCount" INTEGER NOT NULL DEFAULT 0,
    "phase3TrialsCount" INTEGER NOT NULL DEFAULT 0,
    "phase4TrialsCount" INTEGER NOT NULL DEFAULT 0,
    "officialUrl" TEXT,
    CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Company_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Company_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Company_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyCompetitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceCompanyId" TEXT NOT NULL,
    "targetCompanyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyCompetitor_sourceCompanyId_fkey" FOREIGN KEY ("sourceCompanyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompanyCompetitor_targetCompanyId_fkey" FOREIGN KEY ("targetCompanyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "productType" TEXT,
    "brandName" TEXT,
    "genericName" TEXT,
    "drugClass" TEXT,
    "description" TEXT,
    "therapeuticArea" TEXT,
    "dosageForm" TEXT,
    "approvalStatus" TEXT,
    "approvalDate" TEXT,
    "officialLink" TEXT,
    "labelUrl" TEXT,
    "strength" TEXT,
    "manufacturer" TEXT,
    "images" TEXT,
    "productUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyId" TEXT NOT NULL,
    "aliases" TEXT,
    "keywords" TEXT,
    "searchText" TEXT,
    "deletedAt" DATETIME,
    CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Drug" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "activeIngredient" TEXT,
    "ndcCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyId" TEXT NOT NULL,
    "aliases" TEXT,
    "keywords" TEXT,
    "searchText" TEXT,
    "deletedAt" DATETIME,
    CONSTRAINT "Drug_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "imageUrl" TEXT,
    "position" TEXT NOT NULL DEFAULT 'SIDEBAR',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "Advertisement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNREAD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "ContactInquiry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiSyncState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apiName" TEXT NOT NULL,
    "lastCursor" TEXT,
    "lastSyncTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CompanySubsidiary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanySubsidiary_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyExecutive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "type" TEXT NOT NULL DEFAULT 'LEADERSHIP',
    "biography" TEXT,
    "appointmentDate" TEXT,
    "education" TEXT,
    "experience" TEXT,
    "linkedinUrl" TEXT,
    "department" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyExecutive_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyClinicalTrial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nctId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "phase" TEXT,
    "status" TEXT,
    "enrollment" INTEGER,
    "url" TEXT,
    "conditions" TEXT,
    "locations" TEXT,
    "collaborators" TEXT,
    "diseases" TEXT,
    "indications" TEXT,
    "interventions" TEXT,
    "arms" TEXT,
    "countries" TEXT,
    "sites" TEXT,
    "investigators" TEXT,
    "resultsUrl" TEXT,
    "documentsUrl" TEXT,
    "trialCategory" TEXT NOT NULL DEFAULT 'SPONSOR_REGISTERED',
    "provenance" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyClinicalTrial_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyPublication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pmid" TEXT,
    "doi" TEXT,
    "title" TEXT NOT NULL,
    "journal" TEXT,
    "publicationDate" TEXT,
    "authors" TEXT,
    "institutions" TEXT,
    "citationCount" INTEGER,
    "keywords" TEXT,
    "abstract" TEXT,
    "url" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyPublication_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyPatent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT,
    "url" TEXT,
    "agencies" TEXT,
    "expiryDate" TEXT,
    "filingDate" TEXT,
    "applicationDate" TEXT,
    "grantDate" TEXT,
    "office" TEXT,
    "inventors" TEXT,
    "technology" TEXT,
    "claims" TEXT,
    "patentFamily" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyPatent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyNews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "source" TEXT,
    "summary" TEXT,
    "type" TEXT,
    "publishDate" DATETIME,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyNews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyRegulatoryAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agency" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "issueDate" DATETIME,
    "inspectionDate" DATETIME,
    "resolutionDate" DATETIME,
    "severity" TEXT,
    "url" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyRegulatoryAction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyRelationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "relatedEntityId" TEXT,
    "relatedName" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "financialValue" TEXT,
    "strategicRationale" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyRelationship_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "location" TEXT,
    "type" TEXT,
    "url" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PDF',
    "url" TEXT,
    "category" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyFacility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "capabilities" TEXT,
    "certifications" TEXT,
    "country" TEXT,
    "city" TEXT,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "status" TEXT,
    "verifiedDate" TEXT,
    "source" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyFacility_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "source" TEXT,
    "url" TEXT,
    "publishedDate" DATETIME,
    "version" TEXT,
    "checksum" TEXT,
    "companyId" TEXT,
    "drugId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyFinancialPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "revenue" TEXT,
    "netIncome" TEXT,
    "operatingIncome" TEXT,
    "ebitda" TEXT,
    "grossProfit" TEXT,
    "cash" TEXT,
    "debt" TEXT,
    "assets" TEXT,
    "liabilities" TEXT,
    "eps" TEXT,
    "dividend" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyFinancialPeriod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyWorkforce" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "hiringTrend" TEXT,
    "departments" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyWorkforce_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyPipelineAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetName" TEXT NOT NULL,
    "therapeuticArea" TEXT,
    "indication" TEXT,
    "mechanismOfAction" TEXT,
    "phase" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyPipelineAsset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "department" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "linkedin" TEXT,
    "facebook" TEXT,
    "x" TEXT,
    "instagram" TEXT,
    "youtube" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyDigitalAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "description" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyDigitalAsset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyESG" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportingYear" INTEGER,
    "environmentScore" REAL,
    "socialScore" REAL,
    "governanceScore" REAL,
    "sustainabilityReportUrl" TEXT,
    "carbonFootprint" TEXT,
    "csrInitiatives" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyESG_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyDrugRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyDrugRelation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompanyDrugRelation_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyTrialRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyTrialRelation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompanyTrialRelation_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "GlobalClinicalTrial" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyPatentRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "patentId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyPatentRelation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompanyPatentRelation_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "GlobalPatent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DrugDiseaseRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "drugId" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DrugDiseaseRelation_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DrugDiseaseRelation_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "GlobalDisease" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DrugTargetRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "drugId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DrugTargetRelation_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DrugTargetRelation_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "GlobalTarget" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatentDrugRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patentId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatentDrugRelation_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "GlobalPatent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PatentDrugRelation_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrialDrugRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trialId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrialDrugRelation_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "GlobalClinicalTrial" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrialDrugRelation_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GlobalClinicalTrial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nctId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "phase" TEXT,
    "status" TEXT,
    "aliases" TEXT,
    "keywords" TEXT,
    "searchText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "enrollment" INTEGER,
    "sponsorUrl" TEXT,
    "officialUrl" TEXT
);

-- CreateTable
CREATE TABLE "GlobalPatent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "aliases" TEXT,
    "keywords" TEXT,
    "searchText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GlobalDisease" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "aliases" TEXT,
    "keywords" TEXT,
    "searchText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GlobalTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "aliases" TEXT,
    "keywords" TEXT,
    "searchText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StagingPayload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Connector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'IDLE'
);

-- CreateTable
CREATE TABLE "SyncRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectorId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "syncStatus" TEXT,
    "syncErrors" TEXT,
    "lastFailed" DATETIME
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "syncRunId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "syncJobId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NormalizationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ValidationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stackTrace" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VersionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EntityHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AISummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EmbeddingQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Chunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "KnowledgeNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "KnowledgeEdge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TrialCondition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrialCondition_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "GlobalClinicalTrial" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrialLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "countryId" TEXT,
    "stateId" TEXT,
    "cityId" TEXT,
    "trialId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrialLocation_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "GlobalClinicalTrial" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrialLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TrialLocation_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TrialLocation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudySite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT,
    "trialId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudySite_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "GlobalClinicalTrial" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConnectorLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "connectorId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConnectorLog_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ValidationHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditTrail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CompanyTimeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "event" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyTimeline_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RetryQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SyncError" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DataConfidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "reasons" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Embedding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "vector" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_CompanyToCompanyCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CompanyToCompanyCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CompanyToCompanyCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "CompanyCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "State_countryId_idx" ON "State"("countryId");

-- CreateIndex
CREATE INDEX "City_stateId_idx" ON "City"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCategory_name_key" ON "CompanyCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCategory_slug_key" ON "CompanyCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Company_lei_key" ON "Company"("lei");

-- CreateIndex
CREATE UNIQUE INDEX "Company_rorId_key" ON "Company"("rorId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_wikidataId_key" ON "Company"("wikidataId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_openCorpId_key" ON "Company"("openCorpId");

-- CreateIndex
CREATE INDEX "Company_slug_idx" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_userId_idx" ON "Company"("userId");

-- CreateIndex
CREATE INDEX "CompanyCompetitor_sourceCompanyId_idx" ON "CompanyCompetitor"("sourceCompanyId");

-- CreateIndex
CREATE INDEX "CompanyCompetitor_targetCompanyId_idx" ON "CompanyCompetitor"("targetCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCompetitor_sourceCompanyId_targetCompanyId_key" ON "CompanyCompetitor"("sourceCompanyId", "targetCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Drug_slug_key" ON "Drug"("slug");

-- CreateIndex
CREATE INDEX "Drug_slug_idx" ON "Drug"("slug");

-- CreateIndex
CREATE INDEX "Drug_companyId_idx" ON "Drug"("companyId");

-- CreateIndex
CREATE INDEX "Advertisement_companyId_idx" ON "Advertisement"("companyId");

-- CreateIndex
CREATE INDEX "ContactInquiry_companyId_idx" ON "ContactInquiry"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiSyncState_apiName_key" ON "ApiSyncState"("apiName");

-- CreateIndex
CREATE INDEX "CompanySubsidiary_companyId_idx" ON "CompanySubsidiary"("companyId");

-- CreateIndex
CREATE INDEX "CompanyExecutive_companyId_idx" ON "CompanyExecutive"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyClinicalTrial_nctId_key" ON "CompanyClinicalTrial"("nctId");

-- CreateIndex
CREATE INDEX "CompanyClinicalTrial_companyId_idx" ON "CompanyClinicalTrial"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPublication_pmid_key" ON "CompanyPublication"("pmid");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPublication_doi_key" ON "CompanyPublication"("doi");

-- CreateIndex
CREATE INDEX "CompanyPublication_companyId_idx" ON "CompanyPublication"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPatent_patentNumber_key" ON "CompanyPatent"("patentNumber");

-- CreateIndex
CREATE INDEX "CompanyPatent_companyId_idx" ON "CompanyPatent"("companyId");

-- CreateIndex
CREATE INDEX "CompanyNews_companyId_idx" ON "CompanyNews"("companyId");

-- CreateIndex
CREATE INDEX "CompanyRegulatoryAction_companyId_idx" ON "CompanyRegulatoryAction"("companyId");

-- CreateIndex
CREATE INDEX "CompanyRelationship_companyId_idx" ON "CompanyRelationship"("companyId");

-- CreateIndex
CREATE INDEX "CompanyJob_companyId_idx" ON "CompanyJob"("companyId");

-- CreateIndex
CREATE INDEX "CompanyDocument_companyId_idx" ON "CompanyDocument"("companyId");

-- CreateIndex
CREATE INDEX "CompanyFacility_companyId_idx" ON "CompanyFacility"("companyId");

-- CreateIndex
CREATE INDEX "CompanyFinancialPeriod_companyId_idx" ON "CompanyFinancialPeriod"("companyId");

-- CreateIndex
CREATE INDEX "CompanyWorkforce_companyId_idx" ON "CompanyWorkforce"("companyId");

-- CreateIndex
CREATE INDEX "CompanyPipelineAsset_companyId_idx" ON "CompanyPipelineAsset"("companyId");

-- CreateIndex
CREATE INDEX "CompanyContact_companyId_idx" ON "CompanyContact"("companyId");

-- CreateIndex
CREATE INDEX "CompanyDigitalAsset_companyId_idx" ON "CompanyDigitalAsset"("companyId");

-- CreateIndex
CREATE INDEX "CompanyESG_companyId_idx" ON "CompanyESG"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalClinicalTrial_nctId_key" ON "GlobalClinicalTrial"("nctId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalPatent_patentNumber_key" ON "GlobalPatent"("patentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalDisease_name_key" ON "GlobalDisease"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalTarget_name_key" ON "GlobalTarget"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Connector_name_key" ON "Connector"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_CompanyToCompanyCategory_AB_unique" ON "_CompanyToCompanyCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_CompanyToCompanyCategory_B_index" ON "_CompanyToCompanyCategory"("B");
