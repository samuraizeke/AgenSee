import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to generate random dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

// Dummy data
const clients = [
  { first_name: 'John', last_name: 'Martinez', email: 'john.martinez@email.com', phone: '(555) 234-5678', address: '123 Oak Street, Austin, TX 78701', notes: 'Prefers email communication. Has been a client since 2019.' },
  { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.j@email.com', phone: '(555) 345-6789', address: '456 Maple Ave, Austin, TX 78702', notes: 'VIP client. Referred by her brother Mike Johnson.' },
  { first_name: 'Michael', last_name: 'Chen', email: 'mchen@techcorp.com', phone: '(555) 456-7890', address: '789 Pine Road, Round Rock, TX 78664', notes: 'Business owner. Interested in umbrella policy.' },
  { first_name: 'Emily', last_name: 'Davis', email: 'emily.davis@gmail.com', phone: '(555) 567-8901', address: '321 Elm Street, Cedar Park, TX 78613', notes: 'New homeowner as of March 2024.' },
  { first_name: 'Robert', last_name: 'Wilson', email: 'rwilson@lawfirm.com', phone: '(555) 678-9012', address: '654 Birch Lane, Georgetown, TX 78628', notes: 'Attorney. Needs comprehensive coverage.' },
  { first_name: 'Lisa', last_name: 'Anderson', email: 'lisa.anderson@email.com', phone: '(555) 789-0123', address: '987 Cedar Drive, Pflugerville, TX 78660', notes: 'Recently married. Updating beneficiaries.' },
  { first_name: 'David', last_name: 'Thompson', email: 'dthompson@email.com', phone: '(555) 890-1234', address: '147 Walnut Way, Leander, TX 78641', notes: 'Has teenage drivers. Concerned about auto rates.' },
  { first_name: 'Jennifer', last_name: 'Garcia', email: 'jgarcia@startup.io', phone: '(555) 901-2345', address: '258 Spruce Court, Austin, TX 78703', notes: 'Startup founder. Needs business insurance.' },
  { first_name: 'William', last_name: 'Brown', email: 'wbrown@retired.net', phone: '(555) 012-3456', address: '369 Ash Boulevard, Austin, TX 78704', notes: 'Retired. Looking at life insurance options.' },
  { first_name: 'Amanda', last_name: 'Miller', email: 'amanda.miller@hospital.org', phone: '(555) 123-4567', address: '741 Hickory Street, Austin, TX 78705', notes: 'Nurse. Interested in disability insurance.' },
  { first_name: 'James', last_name: 'Taylor', email: 'jtaylor@construction.com', phone: '(555) 234-5679', address: '852 Poplar Place, Manor, TX 78653', notes: 'Construction business. High-risk occupation.' },
  { first_name: 'Michelle', last_name: 'Lee', email: 'mlee@design.co', phone: '(555) 345-6780', address: '963 Sycamore Lane, Austin, TX 78706', notes: 'Interior designer. Works from home.' },
];

const carriers = ['State Farm', 'Allstate', 'Progressive', 'GEICO', 'Liberty Mutual', 'USAA', 'Nationwide', 'Travelers', 'American Family', 'Farmers'];

const policyTypes = ['auto', 'home', 'life', 'health', 'business', 'umbrella'] as const;

const activityTypes = ['call', 'email', 'task', 'meeting', 'note'] as const;

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('policies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Existing data cleared\n');

  // Insert clients
  console.log('👥 Inserting clients...');
  const { data: insertedClients, error: clientError } = await supabase
    .from('clients')
    .insert(clients)
    .select();

  if (clientError) {
    console.error('Error inserting clients:', clientError);
    process.exit(1);
  }
  console.log(`✅ Inserted ${insertedClients.length} clients\n`);

  // Insert policies for each client
  console.log('📋 Inserting policies...');
  const policies: any[] = [];

  // Track policy index to control expiration dates
  let policyIndex = 0;

  for (const client of insertedClients) {
    // Each client gets 1-3 policies
    const numPolicies = Math.floor(Math.random() * 3) + 1;
    const usedTypes = new Set<string>();

    for (let i = 0; i < numPolicies; i++) {
      let policyType: typeof policyTypes[number];
      do {
        policyType = policyTypes[Math.floor(Math.random() * policyTypes.length)];
      } while (usedTypes.has(policyType) && usedTypes.size < policyTypes.length);
      usedTypes.add(policyType);

      // Create a mix of expiration scenarios for realistic demo:
      // - Some policies expiring within 7 days (urgent)
      // - Some expiring within 30 days (upcoming)
      // - Some expiring in the future (safe)
      // - Some already expired
      let effectiveDate: Date;
      let expirationDate: Date;
      const today = new Date();

      if (policyIndex % 6 === 0) {
        // Expiring in 3-7 days (urgent)
        expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() + 3 + Math.floor(Math.random() * 5));
        effectiveDate = new Date(expirationDate);
        effectiveDate.setFullYear(effectiveDate.getFullYear() - 1);
      } else if (policyIndex % 6 === 1) {
        // Expiring in 8-30 days (upcoming)
        expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() + 8 + Math.floor(Math.random() * 23));
        effectiveDate = new Date(expirationDate);
        effectiveDate.setFullYear(effectiveDate.getFullYear() - 1);
      } else if (policyIndex % 6 === 2) {
        // Already expired (within last 60 days)
        expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() - 1 - Math.floor(Math.random() * 60));
        effectiveDate = new Date(expirationDate);
        effectiveDate.setFullYear(effectiveDate.getFullYear() - 1);
      } else {
        // Safe - expiring 2-8 months from now
        expirationDate = new Date(today);
        expirationDate.setMonth(today.getMonth() + 2 + Math.floor(Math.random() * 7));
        effectiveDate = new Date(expirationDate);
        effectiveDate.setFullYear(effectiveDate.getFullYear() - 1);
      }

      policyIndex++;

      const isExpired = expirationDate < today;
      const status = isExpired
        ? (Math.random() > 0.3 ? 'expired' : 'cancelled')
        : (Math.random() > 0.1 ? 'active' : 'pending');

      const premiumRanges: Record<string, [number, number]> = {
        auto: [800, 2500],
        home: [1200, 4000],
        life: [300, 1500],
        health: [4000, 12000],
        business: [2000, 8000],
        umbrella: [200, 800],
      };

      const [min, max] = premiumRanges[policyType];
      const premium = Math.floor(Math.random() * (max - min) + min);

      policies.push({
        client_id: client.id,
        carrier: carriers[Math.floor(Math.random() * carriers.length)],
        policy_number: `POL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        type: policyType,
        effective_date: formatDate(effectiveDate),
        expiration_date: formatDate(expirationDate),
        premium: premium,
        status: status,
        details: generatePolicyDetails(policyType),
      });
    }
  }

  const { data: insertedPolicies, error: policyError } = await supabase
    .from('policies')
    .insert(policies)
    .select();

  if (policyError) {
    console.error('Error inserting policies:', policyError);
    process.exit(1);
  }
  console.log(`✅ Inserted ${insertedPolicies.length} policies\n`);

  // Insert activities
  console.log('📝 Inserting activities...');
  const activities: any[] = [];
  const activityDescriptions: Record<string, string[]> = {
    call: [
      'Discussed policy renewal options',
      'Follow-up call about claim status',
      'Annual policy review call',
      'Quote request follow-up',
      'Claims inquiry response',
    ],
    email: [
      'Sent policy documents',
      'Coverage update confirmation',
      'Premium payment reminder',
      'New policy welcome email',
      'Quote comparison sent',
    ],
    task: [
      'Review policy for renewal',
      'Update client contact information',
      'Process endorsement request',
      'Prepare annual review materials',
      'File claim documentation',
    ],
    meeting: [
      'Annual coverage review meeting',
      'New client consultation',
      'Claims discussion meeting',
      'Policy upgrade consultation',
      'Business insurance assessment',
    ],
    note: [
      'Client mentioned interest in increasing coverage',
      'Noted change in family status',
      'Client moving to new address next month',
      'Requested callback next week',
      'Client satisfied with recent claim handling',
    ],
  };

  for (const client of insertedClients) {
    // Each client gets 2-5 activities
    const numActivities = Math.floor(Math.random() * 4) + 2;
    const clientPolicies = insertedPolicies.filter(p => p.client_id === client.id);

    for (let i = 0; i < numActivities; i++) {
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const descriptions = activityDescriptions[activityType];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];

      // Use dates that span past and future for realistic demo
      const dueDate = randomDate(new Date('2024-12-01'), new Date('2025-02-28'));
      const isPast = dueDate < new Date();
      const completed = isPast ? Math.random() > 0.3 : Math.random() > 0.8;

      // IMPORTANT: When linking to a policy, always use a policy that belongs to this client
      // This ensures relationship integrity (policy.client_id === activity.client_id)
      const linkedPolicy = clientPolicies.length > 0 && Math.random() > 0.3
        ? clientPolicies[Math.floor(Math.random() * clientPolicies.length)]
        : null;

      activities.push({
        type: activityType,
        description: description,
        client_id: client.id,
        policy_id: linkedPolicy?.id || null,
        due_date: dueDate.toISOString(),
        completed: completed,
        completed_at: completed ? new Date(dueDate.getTime() + Math.random() * 86400000 * 3).toISOString() : null,
      });
    }
  }

  const { data: insertedActivities, error: activityError } = await supabase
    .from('activities')
    .insert(activities)
    .select();

  if (activityError) {
    console.error('Error inserting activities:', activityError);
    process.exit(1);
  }
  console.log(`✅ Inserted ${insertedActivities.length} activities\n`);

  // Insert document records (without actual files)
  console.log('📄 Inserting document records...');
  const documents: any[] = [];
  const documentNames = [
    'policy_declaration.pdf',
    'proof_of_insurance.pdf',
    'claim_form.pdf',
    'id_verification.jpg',
    'property_photos.zip',
    'vehicle_registration.pdf',
    'medical_records.pdf',
    'inspection_report.pdf',
  ];

  for (const client of insertedClients.slice(0, 8)) {
    const numDocs = Math.floor(Math.random() * 3) + 1;
    const clientPolicies = insertedPolicies.filter(p => p.client_id === client.id);

    for (let i = 0; i < numDocs; i++) {
      const fileName = documentNames[Math.floor(Math.random() * documentNames.length)];
      const mimeType = fileName.endsWith('.pdf') ? 'application/pdf'
        : fileName.endsWith('.jpg') ? 'image/jpeg'
        : 'application/zip';

      // IMPORTANT: When linking to a policy, always use a policy that belongs to this client
      // This ensures relationship integrity (policy.client_id === document.client_id)
      const linkedPolicy = clientPolicies.length > 0 && Math.random() > 0.5
        ? clientPolicies[Math.floor(Math.random() * clientPolicies.length)]
        : null;

      documents.push({
        client_id: client.id,
        policy_id: linkedPolicy?.id || null,
        file_name: `${client.last_name.toLowerCase()}_${fileName}`,
        file_path: `documents/${client.id}/${Date.now()}_${fileName}`,
        file_size: Math.floor(Math.random() * 5000000) + 100000,
        mime_type: mimeType,
      });
    }
  }

  const { data: insertedDocuments, error: documentError } = await supabase
    .from('documents')
    .insert(documents)
    .select();

  if (documentError) {
    console.error('Error inserting documents:', documentError);
    process.exit(1);
  }
  console.log(`✅ Inserted ${insertedDocuments.length} document records\n`);

  // Summary
  console.log('═'.repeat(50));
  console.log('🎉 Database seeded successfully!\n');
  console.log('Summary:');
  console.log(`  • ${insertedClients.length} clients`);
  console.log(`  • ${insertedPolicies.length} policies`);
  console.log(`  • ${insertedActivities.length} activities`);
  console.log(`  • ${insertedDocuments.length} documents`);
  console.log('═'.repeat(50));
}

function generatePolicyDetails(type: string): Record<string, any> {
  switch (type) {
    case 'auto':
      return {
        vehicle: {
          year: 2020 + Math.floor(Math.random() * 5),
          make: ['Toyota', 'Honda', 'Ford', 'Tesla', 'BMW'][Math.floor(Math.random() * 5)],
          model: ['Camry', 'Accord', 'F-150', 'Model 3', 'X5'][Math.floor(Math.random() * 5)],
          vin: `1HGBH${Math.random().toString(36).substring(2, 13).toUpperCase()}`,
        },
        coverage: {
          liability: '100/300/100',
          collision_deductible: [500, 1000][Math.floor(Math.random() * 2)],
          comprehensive_deductible: [250, 500][Math.floor(Math.random() * 2)],
        },
      };
    case 'home':
      return {
        property: {
          type: ['Single Family', 'Condo', 'Townhouse'][Math.floor(Math.random() * 3)],
          year_built: 1990 + Math.floor(Math.random() * 34),
          square_feet: 1500 + Math.floor(Math.random() * 2500),
        },
        coverage: {
          dwelling: 250000 + Math.floor(Math.random() * 500000),
          personal_property: 100000 + Math.floor(Math.random() * 150000),
          liability: 300000,
          deductible: [1000, 2500, 5000][Math.floor(Math.random() * 3)],
        },
      };
    case 'life':
      return {
        type: ['Term 20', 'Term 30', 'Whole Life'][Math.floor(Math.random() * 3)],
        face_amount: [250000, 500000, 750000, 1000000][Math.floor(Math.random() * 4)],
        beneficiaries: ['Spouse', 'Children', 'Estate'][Math.floor(Math.random() * 3)],
      };
    case 'health':
      return {
        plan_type: ['PPO', 'HMO', 'HDHP'][Math.floor(Math.random() * 3)],
        deductible: [1500, 3000, 6000][Math.floor(Math.random() * 3)],
        out_of_pocket_max: [6000, 8000, 12000][Math.floor(Math.random() * 3)],
        dependents: Math.floor(Math.random() * 4),
      };
    case 'business':
      return {
        business_type: ['LLC', 'Corporation', 'Sole Proprietorship'][Math.floor(Math.random() * 3)],
        coverage_types: ['General Liability', 'Professional Liability', 'Property', 'Workers Comp'],
        employees: Math.floor(Math.random() * 50) + 1,
        annual_revenue: 100000 + Math.floor(Math.random() * 900000),
      };
    case 'umbrella':
      return {
        coverage_amount: [1000000, 2000000, 5000000][Math.floor(Math.random() * 3)],
        underlying_policies: ['Auto', 'Home'],
      };
    default:
      return {};
  }
}

seed().catch(console.error);
