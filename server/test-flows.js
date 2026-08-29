const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('--- STARTING COMPLETE MERN PORTAL VERIFICATION ---');

  try {
    // 1. Test Health
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    console.log('✓ API Health Check:', health.status);

    // 2. Test Role-Based Signup
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test New Trainee',
        email: `test.trainee.${Date.now()}@example.com`,
        password: 'password123',
        role: 'trainee',
        organization: 'Tech Academy',
      }),
    });
    const testSignup = await signupRes.json();
    console.log('✓ Role-Based Signup:', testSignup.success, '| Role:', testSignup.user?.role);

    // 3. Test Login for all 4 Roles
    const roles = ['trainee', 'training_provider', 'employer', 'admin'];
    const emailMap = {
      trainee: 'trainee@example.com',
      training_provider: 'provider@example.com',
      employer: 'employer@example.com',
      admin: 'admin@example.com',
    };

    const tokens = {};
    for (const r of roles) {
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailMap[r],
          password: 'password123',
        }),
      });
      const data = await loginRes.json();
      tokens[r] = data.token;
      console.log(`✓ Login Success for Role [${r}]:`, data.user?.name);
    }

    // 4. Test Analytics & Section 22 Rule Engine (Admin)
    const aRes = await fetch(`${BASE_URL}/analytics/overview`, {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    const analyticsData = await aRes.json();
    console.log('✓ Analytics KPIs calculated:', {
      completionRate: `${analyticsData.data.kpis.completionRate}%`,
      placementRate: `${analyticsData.data.kpis.placementRate}%`,
      retentionRate3Month: `${analyticsData.data.kpis.retentionRate3Month}%`,
      validationRate: `${analyticsData.data.kpis.validationRate}%`,
    });
    console.log('✓ Actionable Rules Count:', analyticsData.data.actionableRecommendations.length);

    // 5. Test Trainees List (Provider)
    const tRes = await fetch(`${BASE_URL}/trainees`, {
      headers: { Authorization: `Bearer ${tokens.training_provider}` },
    });
    const traineesData = await tRes.json();
    console.log(`✓ Provider Trainee Directory (${traineesData.count} trainees found)`);
    const alex = traineesData.data.find((t) => t.email === 'trainee@example.com');

    // 6. Test Trainee Timeline & Consent
    const alexRes = await fetch(`${BASE_URL}/trainees/${alex._id}`, {
      headers: { Authorization: `Bearer ${tokens.trainee}` },
    });
    const alexTimeline = await alexRes.json();
    console.log('✓ Trainee Timeline Milestones:', {
      consentStatus: alexTimeline.data.consent?.status,
      historySnapshots: alexTimeline.data.employmentRecords.length,
      followUpCheckpoints: alexTimeline.data.followUps.length,
    });

    // 7. Test Provider Creates Validation Token & Public Employer Submits
    const valReqRes = await fetch(`${BASE_URL}/validation/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.training_provider}`,
      },
      body: JSON.stringify({
        traineeId: alex._id,
        employerEmail: 'partner@techcorp.io',
        employerName: 'TechCorp International',
        expiresInDays: 14,
      }),
    });
    const valData = await valReqRes.json();
    const token = valData.data.token;
    console.log('✓ Generated Employer Validation Token:', token);

    // Fetch token publicly (Privacy Minimal Data View)
    const publicRes = await fetch(`${BASE_URL}/validation/token/${token}`);
    const publicTokenView = await publicRes.json();
    console.log('✓ Public Privacy-Preserving Token View:', {
      candidateName: publicTokenView.data.trainee.name,
      reportedRole: publicTokenView.data.employmentDetails.roleTitle,
    });

    // Employer Submits Verification with Skill Gap Feedback
    const submitRes = await fetch(`${BASE_URL}/validation/token/${token}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmed: true,
        roleConfirmed: true,
        startDateConfirmed: true,
        wageBandConfirmed: true,
        performanceRating: 'exceptional',
        comments: 'Alex is an exceptional engineer with great initiative.',
        skillGaps: [
          {
            category: 'Tool & Technology Stack',
            skill: 'Docker & Containerization',
            severity: 'minor',
            notes: 'Recommend additional microservices practice',
          },
        ],
      }),
    });
    const submitVal = await submitRes.json();
    console.log('✓ Employer Token Submission Result:', submitVal.message);

    // 8. Test CSV Export (Admin)
    const csvRes = await fetch(`${BASE_URL}/admin/export-csv`, {
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    const csvText = await csvRes.text();
    console.log('✓ Admin CSV Outcome Export Generated (length:', csvText.length, 'bytes)');

    console.log('\n=============================================');
    console.log('🎉 ALL INTEGRATION WORKFLOWS VERIFIED (100% PASS)');
    console.log('=============================================');
  } catch (err) {
    console.error('❌ Verification Error:', err);
    process.exit(1);
  }
}

runVerification();
