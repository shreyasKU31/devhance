import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Starting database reset (preserving Users)...");

  try {
    // Delete in order of dependencies (though MongoDB doesn't strictly enforce FKs, it's good practice)
    
    // 1. Delete Payments (depends on User, CaseStudy, VCReport)
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`✅ Deleted ${deletedPayments.count} Payments`);

    // 2. Delete VC Reports (depends on User, CaseStudy)
    const deletedVCReports = await prisma.vCReport.deleteMany({});
    console.log(`✅ Deleted ${deletedVCReports.count} VC Reports`);

    // 3. Delete Case Studies (depends on User)
    const deletedCaseStudies = await prisma.caseStudy.deleteMany({});
    console.log(`✅ Deleted ${deletedCaseStudies.count} Case Studies`);

    // 4. Delete Repo Data (Independent)
    const deletedRepoData = await prisma.repoData.deleteMany({});
    console.log(`✅ Deleted ${deletedRepoData.count} Repo Data entries`);

    console.log("✨ Database reset complete. Users were preserved.");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
