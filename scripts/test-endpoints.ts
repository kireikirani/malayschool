import "dotenv/config";

let BASE_URL = "http://localhost:3000";

async function detectBaseUrl() {
  const ports = [3001, 3000, 3002, 3005];
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}/api/auth/session`);
      // Any response (even 404) means a server is alive on this port
      console.log(`Detected active Next.js dev server at http://localhost:${port}`);
      return `http://localhost:${port}`;
    } catch {}
  }
  // Fallback to 3001
  console.log("Could not find responding server, falling back to http://localhost:3001");
  return "http://localhost:3001";
}

async function runTests() {
  console.log("=== Starting Dashboard Endpoint Integration Tests ===");
  BASE_URL = await detectBaseUrl();

  // 1. Sign in as admin to get the session cookie
  console.log("\n1. Authenticating as Admin...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Origin": BASE_URL
    },
    body: JSON.stringify({
      email: "admin@malayschool.com",
      password: "Admin123!",
    }),
  });

  if (!loginRes.ok) {
    throw new Error(`Authentication failed: ${loginRes.status} ${await loginRes.text()}`);
  }

  const setCookie = loginRes.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("No set-cookie header returned during login.");
  }
  console.log("Authenticated successfully.");

  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: setCookie,
    Origin: BASE_URL
  };

  // Helper function to test an API resource CRUD flow
  async function testCrud({
    name,
    createPath,
    detailPath,
    createPayload,
    updatePayload,
    isIdString = true,
    skipUpdate = false,
  }: {
    name: string;
    createPath: string;
    detailPath: (id: string | number) => string;
    createPayload: any;
    updatePayload: any;
    isIdString?: boolean;
    skipUpdate?: boolean;
  }) {
    console.log(`\n=== Testing CRUD for: ${name} ===`);

    // Create
    console.log(`[POST] Creating ${name}...`);
    const createRes = await fetch(`${BASE_URL}${createPath}`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(createPayload),
    });

    if (!createRes.ok) {
      throw new Error(`[POST] Failed to create ${name}: ${createRes.status} ${await createRes.text()}`);
    }

    const resJson = await createRes.json();
    const createdRecord = resJson.data;
    const id = createdRecord.id;
    console.log(`[POST] Success. Created ID: ${id}`);

    // List
    console.log(`[GET] Listing ${name}...`);
    const listRes = await fetch(`${BASE_URL}${createPath}`, {
      headers: authHeaders,
    });
    if (!listRes.ok) {
      throw new Error(`[GET] Failed to list ${name}: ${listRes.status}`);
    }
    console.log(`[GET] List success: ${listRes.status}`);

    // Read Detail
    console.log(`[GET] Reading detail of ${name} ID ${id}...`);
    const getDetailRes = await fetch(`${BASE_URL}${detailPath(id)}`, {
      headers: authHeaders,
    });
    if (!getDetailRes.ok) {
      throw new Error(`[GET] Failed to get detail for ${name} ID ${id}: ${getDetailRes.status}`);
    }
    console.log(`[GET] Detail success: ${getDetailRes.status}`);

    // Update (PATCH)
    if (!skipUpdate) {
      console.log(`[PATCH] Updating ${name} ID ${id}...`);
      const patchRes = await fetch(`${BASE_URL}${detailPath(id)}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify(updatePayload),
      });
      if (!patchRes.ok) {
        throw new Error(`[PATCH] Failed to update ${name} ID ${id}: ${patchRes.status} ${await patchRes.text()}`);
      }
      console.log(`[PATCH] Update success: ${patchRes.status}`);
    } else {
      console.log(`[PATCH] Skipped (not supported for ${name})`);
    }

    // Delete
    console.log(`[DELETE] Cleaning up ${name} ID ${id}...`);
    const deleteRes = await fetch(`${BASE_URL}${detailPath(id)}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (!deleteRes.ok && deleteRes.status !== 204) {
      throw new Error(`[DELETE] Failed to delete ${name} ID ${id}: ${deleteRes.status}`);
    }
    console.log(`[DELETE] Cleanup success: ${deleteRes.status}`);

    // Verify deleted
    console.log(`[GET] Verifying deletion of ${name} ID ${id}...`);
    const verifyDelRes = await fetch(`${BASE_URL}${detailPath(id)}`, {
      headers: authHeaders,
    });
    if (verifyDelRes.status !== 404) {
      throw new Error(`[GET] Expected 404 for deleted ${name}, but got: ${verifyDelRes.status}`);
    }
    console.log(`[GET] Verification success: ID ${id} is confirmed deleted.`);
  }

  // 2. Test GET Dashboard
  console.log("\n2. Testing Dashboard API Endpoint...");
  const dashboardRes = await fetch(`${BASE_URL}/api/dashboard`, {
    headers: authHeaders,
  });
  if (!dashboardRes.ok) {
    throw new Error(`Failed to fetch /api/dashboard: ${dashboardRes.status}`);
  }
  const dashboardJson = await dashboardRes.json();
  const dashboardData = dashboardJson.data;
  console.log("Dashboard response status: 200 OK");
  console.log("Dashboard Counts:", dashboardData.counts);
  console.log("Dashboard Health:", dashboardData.health);

  // 3. Test GET Settings
  console.log("\n3. Testing Settings API Endpoint...");
  const settingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    headers: authHeaders,
  });
  if (!settingsRes.ok) {
    throw new Error(`Failed to fetch /api/admin/settings: ${settingsRes.status}`);
  }
  console.log("Settings response status: 200 OK");

  // 4. Run CRUD tests for each resource

  // A. News
  await testCrud({
    name: "News",
    createPath: "/api/news",
    detailPath: (id) => `/api/news/${id}`,
    createPayload: {
      title: "Integrity Test News Title",
      slug: `test-news-slug-${Date.now()}`,
      content: "<p>This is test content for integration tests.</p>",
      status: "draft",
    },
    updatePayload: {
      title: "Updated Integrity Test News Title",
    },
  });

  // B. Teachers
  await testCrud({
    name: "Teachers",
    createPath: "/api/teachers",
    detailPath: (id) => `/api/teachers/${id}`,
    createPayload: {
      name: "Integrity Test Teacher",
      position: "Chemistry Teacher",
      biography: "A dedicated science instructor.",
      status: "active",
    },
    updatePayload: {
      position: "Physics Teacher",
    },
  });

  // C. Advertisements
  await testCrud({
    name: "Advertisements",
    createPath: "/api/advertisements",
    detailPath: (id) => `/api/advertisements/${id}`,
    createPayload: {
      name: "Integrity Test Ad",
      type: "external_link",
      placement: "homepage_sidebar",
      content: "https://google.com",
      status: "inactive",
    },
    updatePayload: {
      status: "active",
    },
  });

  // D. Gallery Albums
  await testCrud({
    name: "Gallery Albums",
    createPath: "/api/gallery/albums",
    detailPath: (id) => `/api/gallery/albums/${id}`,
    createPayload: {
      name: "Integrity Test Album",
      description: "Album created during endpoint testing.",
    },
    updatePayload: {
      description: "Updated description for test album.",
    },
  });

  // E. Asrama Pelajar
  await testCrud({
    name: "Asrama Pelajar",
    createPath: "/api/asrama-pelajar",
    detailPath: (id) => `/api/asrama-pelajar/${id}`,
    createPayload: {
      jantina: "lelaki",
      nama: "Test Student Boarder",
      tingkatan: "T5",
      dorm: "Dorm Jupiter",
      namaWaris: "Ahmad bin Kassim",
      noWaris: "0134442233",
      status: "active",
    },
    updatePayload: {
      dorm: "Dorm Mars",
    },
    isIdString: false,
  });

  // F. Unit Dokumen
  await testCrud({
    name: "Unit Dokumen",
    createPath: "/api/unit-dokumen",
    detailPath: (id) => `/api/unit-dokumen/${id}`,
    createPayload: {
      unitSlug: "pentadbiran",
      type: "dokumen",
      label: "Test School Document",
      fileUrl: "/public/documents/test.pdf",
      fileType: "pdf",
      tahun: "2026",
    },
    updatePayload: {
      label: "Updated School Document Label",
    },
    isIdString: false,
  });

  // G. Public Content
  await testCrud({
    name: "Public Content",
    createPath: "/api/admin/content",
    detailPath: (id) => `/api/admin/content/${id}`,
    createPayload: {
      pageKey: "about",
      sectionKey: "intro_test",
      type: "text_block",
      title: "Test Public Title",
      subtitle: "Subtitle text",
      body: "Body text content.",
      isActive: true,
    },
    updatePayload: {
      title: "Updated Public Title",
    },
    isIdString: false,
  });

  // H. Unit Sections
  await testCrud({
    name: "Unit Sections",
    createPath: "/api/admin/units",
    detailPath: (id) => `/api/admin/units/${id}`,
    createPayload: {
      unitSlug: "kurikulum",
      sectionKey: "vision_test",
      type: "text_block",
      title: "Test Unit Title",
      body: "Unit section content.",
      isActive: true,
    },
    updatePayload: {
      title: "Updated Unit Title",
    },
    isIdString: false,
  });

  // I. Pengumuman (Announcements)
  await testCrud({
    name: "Pengumuman",
    createPath: "/api/pengumuman",
    detailPath: (id) => `/api/pengumuman/${id}`,
    createPayload: {
      tajuk: "Test Pengumuman",
      deskripsi: "Ini adalah pengumuman ujian integrasi.",
      imageUrl: "/public/images/test-banner.jpg",
      aktif: true,
      sortOrder: 99,
    },
    updatePayload: {
      tajuk: "Updated Pengumuman",
      aktif: false,
    },
    isIdString: false,
  });

  // J. Unit Reorder
  console.log("\n=== Testing Unit Sections Reorder ===");
  // Create two unit sections to reorder
  const sec1Res = await fetch(`${BASE_URL}/api/admin/units`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ unitSlug: "kurikulum", sectionKey: "reorder_test_a", type: "text_block", title: "Section A", isActive: true }),
  });
  if (!sec1Res.ok) throw new Error(`[Reorder] Failed to create section A: ${await sec1Res.text()}`);
  const sec1Id = (await sec1Res.json()).data.id;

  const sec2Res = await fetch(`${BASE_URL}/api/admin/units`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ unitSlug: "kurikulum", sectionKey: "reorder_test_b", type: "text_block", title: "Section B", isActive: true }),
  });
  if (!sec2Res.ok) throw new Error(`[Reorder] Failed to create section B: ${await sec2Res.text()}`);
  const sec2Id = (await sec2Res.json()).data.id;

  const reorderRes = await fetch(`${BASE_URL}/api/admin/units/reorder`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify([{ id: sec1Id, sortOrder: 2 }, { id: sec2Id, sortOrder: 1 }]),
  });
  if (!reorderRes.ok) throw new Error(`[Reorder] Failed: ${reorderRes.status} ${await reorderRes.text()}`);
  console.log(`[POST] Reorder success: ${reorderRes.status}`);

  // Cleanup
  await fetch(`${BASE_URL}/api/admin/units/${sec1Id}`, { method: "DELETE", headers: authHeaders });
  await fetch(`${BASE_URL}/api/admin/units/${sec2Id}`, { method: "DELETE", headers: authHeaders });
  console.log("[DELETE] Reorder test sections cleaned up.");

  console.log("\n=== All Integration Tests Completed Successfully! ===");
}

runTests().catch((err) => {
  console.error("\n!!! Integration Tests Failed !!!");
  console.error(err);
  process.exit(1);
});
