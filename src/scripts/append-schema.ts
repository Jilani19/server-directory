import fs from 'fs';
import path from 'path';

const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Inject fields into Company
schema = schema.replace(
  /model Company \{[\s\S]*?(?=\n\})/,
  `$&
  // Search & Status Fields
  aliases           String?
  keywords          String?
  searchText        String?
  deletedAt         DateTime?

  // Graph Relations
  drugRelations     CompanyDrugRelation[]
  trialRelations    CompanyTrialRelation[]
  patentRelations   CompanyPatentRelation[]
  
  // Document Intelligence
  globalDocuments   Document[]
`
);

// Inject fields into Drug
schema = schema.replace(
  /model Drug \{[\s\S]*?(?=\n\})/,
  `$&
  // Search & Status Fields
  aliases           String?
  keywords          String?
  searchText        String?
  deletedAt         DateTime?
  
  // Graph Relations
  companyRelations  CompanyDrugRelation[]
  diseaseRelations  DrugDiseaseRelation[]
  targetRelations   DrugTargetRelation[]
  patentRelations   PatentDrugRelation[]
  trialRelations    TrialDrugRelation[]
  documents         Document[]
`
);

// Inject fields into Product
schema = schema.replace(
  /model Product \{[\s\S]*?(?=\n\})/,
  `$&
  // Search & Status Fields
  aliases           String?
  keywords          String?
  searchText        String?
  deletedAt         DateTime?
`
);

// Inject Document Intelligence
const documentModels = `
// =============================
// DOCUMENT INTELLIGENCE
// =============================
model Document {
  id              String   @id @default(uuid())
  title           String
  documentType    String   // 10-K, CLINICAL_PROTOCOL, FDA_LABEL, etc
  source          String?
  url             String?
  publishedDate   DateTime?
  version         String?
  checksum        String?
  
  // Link to existing models
  companyId       String?
  company         Company? @relation(fields: [companyId], references: [id])
  drugId          String?
  drug            Drug?    @relation(fields: [drugId], references: [id])
  // Trial, Patent, Publication could be linked similarly if they existed globally
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
`;

// Inject Knowledge Graph Models
const graphModels = `
// =============================
// KNOWLEDGE GRAPH FOUNDATION
// =============================
model CompanyDrugRelation {
  id          String   @id @default(uuid())
  companyId   String
  drugId      String
  role        String   // OWNS, LICENSES, DEVELOPS
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  drug        Drug     @relation(fields: [drugId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

model CompanyTrialRelation {
  id          String   @id @default(uuid())
  companyId   String
  trialId     String
  role        String   // SPONSORS, COLLABORATES
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  trial       GlobalClinicalTrial @relation(fields: [trialId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

model CompanyPatentRelation {
  id          String   @id @default(uuid())
  companyId   String
  patentId    String
  role        String   // OWNS, ASSIGNEE
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  patent      GlobalPatent @relation(fields: [patentId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

model DrugDiseaseRelation {
  id          String   @id @default(uuid())
  drugId      String
  diseaseId   String
  role        String   // TREATS, CONTRAINDICATES
  drug        Drug     @relation(fields: [drugId], references: [id], onDelete: Cascade)
  disease     GlobalDisease @relation(fields: [diseaseId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

model DrugTargetRelation {
  id          String   @id @default(uuid())
  drugId      String
  targetId    String
  role        String   // TARGETS, INHIBITS, ANTAGONIZES
  drug        Drug     @relation(fields: [drugId], references: [id], onDelete: Cascade)
  target      GlobalTarget @relation(fields: [targetId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

model PatentDrugRelation {
  id          String   @id @default(uuid())
  patentId    String
  drugId      String
  role        String   // PROTECTS
  patent      GlobalPatent @relation(fields: [patentId], references: [id], onDelete: Cascade)
  drug        Drug     @relation(fields: [drugId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

model TrialDrugRelation {
  id          String   @id @default(uuid())
  trialId     String
  drugId      String
  role        String   // STUDIES, USES_AS_COMPARATOR
  trial       GlobalClinicalTrial @relation(fields: [trialId], references: [id], onDelete: Cascade)
  drug        Drug     @relation(fields: [drugId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

// Global Entities required for the Graph
model GlobalClinicalTrial {
  id          String   @id @default(uuid())
  nctId       String   @unique
  title       String
  phase       String?
  status      String?
  
  // Search & Status
  aliases           String?
  keywords          String?
  searchText        String?
  isActive          Boolean   @default(true)
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  companyRelations  CompanyTrialRelation[]
  drugRelations     TrialDrugRelation[]
}

model GlobalPatent {
  id          String   @id @default(uuid())
  patentNumber String  @unique
  title       String
  
  // Search & Status
  aliases           String?
  keywords          String?
  searchText        String?
  isActive          Boolean   @default(true)
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  companyRelations  CompanyPatentRelation[]
  drugRelations     PatentDrugRelation[]
}

model GlobalDisease {
  id          String   @id @default(uuid())
  name        String   @unique
  
  // Search & Status
  aliases           String?
  keywords          String?
  searchText        String?
  isActive          Boolean   @default(true)
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  drugRelations     DrugDiseaseRelation[]
}

model GlobalTarget {
  id          String   @id @default(uuid())
  name        String   @unique
  
  // Search & Status
  aliases           String?
  keywords          String?
  searchText        String?
  isActive          Boolean   @default(true)
  deletedAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  drugRelations     DrugTargetRelation[]
}
`;

// Inject Data Engineering Models
const dataEngModels = `
// =============================
// DATA ENGINEERING & SYNC LAYER
// =============================
model StagingPayload {
  id          String   @id @default(uuid())
  source      String
  endpoint    String
  payload     String
  checksum    String
  processed   Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Connector {
  id          String   @id @default(uuid())
  name        String   @unique
  version     String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model SyncRun {
  id          String   @id @default(uuid())
  connectorId String
  status      String
  startedAt   DateTime @default(now())
  completedAt DateTime?
}

model SyncJob {
  id          String   @id @default(uuid())
  syncRunId   String
  entityType  String
  entityId    String?
  status      String
  startedAt   DateTime @default(now())
  completedAt DateTime?
}

model SyncLog {
  id          String   @id @default(uuid())
  syncJobId   String
  level       String
  message     String
  createdAt   DateTime @default(now())
}

model NormalizationLog {
  id          String   @id @default(uuid())
  entityType  String
  message     String
  createdAt   DateTime @default(now())
}

model ValidationLog {
  id          String   @id @default(uuid())
  entityType  String
  message     String
  createdAt   DateTime @default(now())
}

model ErrorLog {
  id          String   @id @default(uuid())
  source      String
  message     String
  stackTrace  String?
  createdAt   DateTime @default(now())
}

model VersionHistory {
  id          String   @id @default(uuid())
  entityType  String
  entityId    String
  version     Int
  payload     String
  createdAt   DateTime @default(now())
}

model EntityHistory {
  id          String   @id @default(uuid())
  entityType  String
  entityId    String
  fieldName   String
  oldValue    String?
  newValue    String?
  changedAt   DateTime @default(now())
}
`;

// Inject AI Models
const aiModels = `
// =============================
// AI READY DATABASE
// =============================
model AISummary {
  id          String   @id @default(uuid())
  entityType  String
  entityId    String
  summary     String
  model       String
  createdAt   DateTime @default(now())
}

model EmbeddingQueue {
  id          String   @id @default(uuid())
  entityType  String
  entityId    String
  status      String   @default("PENDING")
  createdAt   DateTime @default(now())
}

model Chunk {
  id          String   @id @default(uuid())
  entityType  String
  entityId    String
  content     String
  chunkIndex  Int
  createdAt   DateTime @default(now())
}

model KnowledgeNode {
  id          String   @id @default(uuid())
  label       String
  entityType  String
  entityId    String
  createdAt   DateTime @default(now())
}

model KnowledgeEdge {
  id          String   @id @default(uuid())
  sourceId    String
  targetId    String
  relationship String
  weight      Float    @default(1.0)
  createdAt   DateTime @default(now())
}
`;

const finalSchema = schema + "\n" + documentModels + "\n" + graphModels + "\n" + dataEngModels + "\n" + aiModels;
fs.writeFileSync(schemaPath, finalSchema);
console.log("Schema appended successfully.");
