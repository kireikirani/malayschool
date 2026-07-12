import { cache } from "react";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  publicContent,
  publicContentItems,
  unitDocuments,
  unitSections,
  unitSectionItems,
  unitJkMembers,
} from "@/db/schema";
import { getSettings } from "@/lib/site-settings";
import { ASRAMA_FASILITI, JK_ASRAMA, WARDENS } from "@/lib/asrama";
import { SCHOOL_NAME } from "@/lib/brand";
import { UNITS } from "@/lib/units";

export type SectionType =
  | "hero"
  | "text_block"
  | "stats"
  | "poster"
  | "file_list"
  | "quick_links"
  | "simple_table"
  | "card_grid"
  | "gallery"
  | "jk_table";

export type ContentItem = {
  id?: number;
  label?: string | null;
  title?: string | null;
  value?: string | null;
  body?: string | null;
  url?: string | null;
  fileUrl?: string | null;
  imageUrl?: string | null;
  meta?: Record<string, unknown> | null;
  sortOrder: number;
  createdAt?: string | Date | null;
};

export type ContentSection = {
  id?: number;
  pageKey?: string;
  unitSlug?: string;
  jkCode?: string | null;
  sectionKey: string;
  type: SectionType;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  linkLabel?: string | null;
  linkUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  items: ContentItem[];
};

type UnitTemplateSpec =
  | { type: "poster"; title: string; subtitle?: string; imageUrl?: string | null; sectionKey?: string }
  | { type: "stats"; title: string; sectionKey?: string }
  | { type: "text_block"; title: string; subtitle?: string | null; body?: string | null; linkLabel?: string | null; linkUrl?: string | null; sectionKey?: string }
  | { type: "jk_table"; title: string; sectionKey?: string }
  | { type: "file_list"; title: string; subtitle?: string; sectionKey?: string }
  | { type: "simple_table"; title: string; subtitle?: string; sectionKey?: string };

function parseMetaJson(value: string | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function withItems<T extends { id: number; sectionKey: string; type: SectionType; title: string | null; subtitle: string | null; body: string | null; imageUrl: string | null; linkLabel: string | null; linkUrl: string | null; isActive: boolean; sortOrder: number }>(
  rows: T[],
  items: Array<{ id: number; label: string | null; title: string | null; value: string | null; body: string | null; url: string | null; fileUrl: string | null; imageUrl: string | null; metaJson: string | null; sortOrder: number; contentId?: number; sectionId?: number; createdAt?: Date | string | null }>,
  linkField: "contentId" | "sectionId",
): ContentSection[] {
  return rows.map((row) => ({
    id: row.id,
    sectionKey: row.sectionKey,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle,
    body: row.body,
    imageUrl: row.imageUrl,
    linkLabel: row.linkLabel,
    linkUrl: row.linkUrl,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    items: items
      .filter((item) => item[linkField] === row.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        id: item.id,
        label: item.label,
        title: item.title,
        value: item.value,
        body: item.body,
        url: item.url,
        fileUrl: item.fileUrl,
        imageUrl: item.imageUrl,
        meta: parseMetaJson(item.metaJson),
        sortOrder: item.sortOrder,
        createdAt: item.createdAt,
      })),
  }));
}

function defaultAboutSections(): ContentSection[] {
  return [
    {
      sectionKey: "hala-tuju",
      type: "card_grid",
      title: "Hala Tuju 2026-2030",
      subtitle: "Lima teras pembangunan utama bagi tempoh 2026 hingga 2030.",
      isActive: true,
      sortOrder: 10,
      items: [
        { label: "1", title: "Kecemerlangan Akademik", body: "Meningkatkan prestasi akademik pelajar secara menyeluruh dengan GPS SPM melebihi 4.5 menjelang 2030.", sortOrder: 0 },
        { label: "2", title: "Pembangunan Modal Insan", body: "Melahirkan pelajar yang seimbang dari segi ilmu, akhlak, sahsiah dan kemahiran kepimpinan.", sortOrder: 1 },
        { label: "3", title: "Kokurikulum Berprestasi Tinggi", body: "Menempatkan sekolah dalam kalangan sekolah terbaik kokurikulum peringkat negeri.", sortOrder: 2 },
        { label: "4", title: "Infrastruktur & Teknologi", body: "Membangunkan prasarana digital dan kemudahan pembelajaran moden selaras dengan keperluan Pendidikan 4.0.", sortOrder: 3 },
        { label: "5", title: "Komuniti & Keluarga", body: "Memperkukuh hubungan antara sekolah, ibu bapa, PIBG dan komuniti setempat.", sortOrder: 4 },
      ],
    },
    {
      sectionKey: "logo-meaning",
      type: "simple_table",
      title: "Logo Sekolah",
      subtitle: "Maksud warna dan lambang.",
      imageUrl: "/brand/logo.png",
      isActive: true,
      sortOrder: 20,
      items: [
        { label: "Biru Tua", value: "Melambangkan kesetiaan, kepercayaan dan keteguhan semangat warga sekolah.", sortOrder: 0 },
        { label: "Kuning Emas", value: "Melambangkan kemuliaan, kecemerlangan ilmu dan cahaya menuju kejayaan.", sortOrder: 1 },
        { label: "Putih", value: "Melambangkan kesucian, keikhlasan dan ketulusan dalam menuntut ilmu.", sortOrder: 2 },
        { label: "Hijau", value: "Melambangkan kesuburan, pertumbuhan dan semangat yang sentiasa segar.", sortOrder: 3 },
      ],
    },
    {
      sectionKey: "flag-meaning",
      type: "simple_table",
      title: "Bendera Sekolah",
      subtitle: "Maksud warna dan elemen.",
      isActive: true,
      sortOrder: 30,
      items: [
        { label: "Warna Biru Tua (Latar)", value: "Melambangkan ketenangan, kesetiaan dan integriti warganya.", sortOrder: 0 },
        { label: "Jalur Kuning Emas", value: "Melambangkan kecemerlangan dan pencapaian tinggi.", sortOrder: 1 },
        { label: "Logo Sekolah (Tengah)", value: "Lambang identiti dan kebanggaan warga sekolah yang bersatu padu.", sortOrder: 2 },
        { label: "Nisbah 2:3", value: "Memperlihatkan keseimbangan dan keharmonian dalam organisasi sekolah.", sortOrder: 3 },
      ],
    },
    {
      sectionKey: "school-song",
      type: "text_block",
      title: "Lagu Sekolah",
      body:
        "SMK Telok Panglima Garang\nSekolah kami yang tercinta\nTempat kami menimba ilmu\nUntuk masa depan yang mulia\n\nBersama kami belajar rajin\nGuru-guru kami panduan\nBersatu hati teguh semangat\nMenuju kejayaan gemilang",
      isActive: true,
      sortOrder: 40,
      items: [],
    },
    {
      sectionKey: "jom-jadi-best",
      type: "text_block",
      title: "Lagu Jom Jadi Best",
      body:
        "Jom jadi best, jom jadi best\nPelajar TPG yang bersemangat\nJom jadi best, jom jadi best\nBersatu hati raih kejayaan",
      isActive: true,
      sortOrder: 50,
      items: [],
    },
    {
      sectionKey: "school-links",
      type: "quick_links",
      title: "Pautan Sekolah",
      subtitle: "Akses segera ke halaman penting sekolah.",
      isActive: true,
      sortOrder: 60,
      items: [
        { title: "Hubungi Kami", url: "/contact", sortOrder: 0 },
        { title: "Dokumen Sekolah", url: "/dokumen-sekolah", sortOrder: 1 },
        { title: "Galeri", url: "/gallery", sortOrder: 2 },
        { title: "Direktori Guru", url: "/teachers", sortOrder: 3 },
      ],
    },
  ];
}

function defaultHomeSections(settings: Awaited<ReturnType<typeof getSettings>>): ContentSection[] {
  return [
    {
      sectionKey: "hero",
      type: "hero",
      title: settings.schoolName,
      subtitle: settings.schoolTagline,
      body: "Sesi Persekolahan 2026/2027",
      imageUrl: "/gallery/sekolah/bangunan-sekolah.jpg",
      linkLabel: "Lihat Dokumen",
      linkUrl: "/dokumen-sekolah",
      isActive: true,
      sortOrder: 0,
      items: [
        { title: "30+ Tahun Pengalaman", sortOrder: 0 },
        { title: "1,200+ Pelajar Aktif", sortOrder: 1 },
        { title: "Persekitaran Selamat", sortOrder: 2 },
      ],
    },
    {
      sectionKey: "school-profile",
      type: "text_block",
      title: `Profil Ringkas ${settings.schoolName}`,
      body: `${SCHOOL_NAME} komited melahirkan pelajar yang cemerlang dari aspek akademik, sahsiah, dan kokurikulum melalui budaya sekolah yang tersusun, selamat, dan berdaya saing.`,
      isActive: true,
      sortOrder: 10,
      items: [],
    },
    {
      sectionKey: "pibg-profile",
      type: "text_block",
      title: "Tabung PIBG & Sumbangan",
      subtitle: "Sumbangan anda membantu pembangunan pendidikan, sahsiah, dan fasiliti sekolah.",
      body: "Sila sertakan rujukan nama anak dan kelas semasa membuat sumbangan.",
      isActive: true,
      sortOrder: 20,
      items: [],
    },
  ];
}

function defaultAsramaSections(): ContentSection[] {
  return [
    {
      sectionKey: "warden-cards",
      type: "card_grid",
      title: "Warden Asrama",
      subtitle: "Pasukan pengurusan dan penyelia asrama.",
      isActive: true,
      sortOrder: 10,
      items: WARDENS.map((warden, index) => ({
        title: warden.name,
        body: warden.position,
        value: warden.phone ?? null,
        sortOrder: index,
      })),
    },
    {
      sectionKey: "jk-asrama",
      type: "jk_table",
      title: "JK Asrama",
      isActive: true,
      sortOrder: 20,
      items: JK_ASRAMA.map((member, index) => ({
        title: member.name,
        value: member.jawatan,
        sortOrder: index,
      })),
    },
    {
      sectionKey: "fasiliti",
      type: "card_grid",
      title: "Fasiliti Asrama",
      isActive: true,
      sortOrder: 30,
      items: ASRAMA_FASILITI.map((facility, index) => ({
        title: facility.label,
        sortOrder: index,
      })),
    },
  ];
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normalizeTitle(value: string) {
  return value.toLowerCase().replace(/[()]/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
}

function extractCommitteeCode(value: string) {
  const match = value.toUpperCase().match(/\b(JM\d+|JK\d+)\b/);
  return match?.[1] ?? null;
}

const MANAGEMENT_TEMPLATE_SECTIONS: Record<string, UnitTemplateSpec[]> = {
  pentadbiran: [
    { type: "poster", title: "Carta Organisasi Sekolah", sectionKey: "carta-organisasi-sekolah" },
    { type: "stats", title: "Hala Tuju 2026-2030", sectionKey: "hala-tuju-2026-2030" },
    {
      type: "text_block",
      title: "Log Harian Pengetua",
      sectionKey: "log-harian-pengetua",
      body: "Akses dan semak maklumat log harian, perancangan strategik, takwim pengurusan, serta pelan pentadbiran pengetua sekolah secara interaktif melalui paparan Canva.",
      linkLabel: "Buka Log Harian Pengetua",
      linkUrl: "https://pengurusandanpentadbiran.my.canva.site/plannerpengetua",
    },
    { type: "jk_table", title: "JM01. JK Pengurusan Sekolah" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-1" },
    { type: "jk_table", title: "JM02. JK Pengurusan Maklumat Sekolah" },
    { type: "jk_table", title: "JM03. JK Pengurusan Sumber Manusia" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-2" },
    { type: "jk_table", title: "JM04. JK Pengurusan Kewangan, Akaun dan Aset Sekolah" },
    { type: "jk_table", title: "JM05. JK Standard Kualiti Pendidikan Malaysia" },
    { type: "jk_table", title: "JM07. JK Bencana Sekolah" },
    { type: "jk_table", title: "JM08. JK Persatuan Ibu Bapa - Guru" },
    { type: "jk_table", title: "JM09. JK Kelab Kebajikan Guru dan Kakitangan" },
    { type: "jk_table", title: "JM10. JK Pengurusan Murid Asal" },
    { type: "jk_table", title: "JM11. JK Pengurusan Tingkatan 6" },
    { type: "jk_table", title: "JK Transformasi Sekolah (TS25/PAK21/PLC/KBAT)" },
    { type: "jk_table", title: "JK Pengurusan Bilik - Bilik Khas" },
    { type: "jk_table", title: "JK Pengurusan Murid" },
    { type: "jk_table", title: "JK Pengurusan Kelas" },
    { type: "jk_table", title: "JK Kajian Tindakan" },
    { type: "jk_table", title: "JK Teknik & Pembangunan Sekolah" },
    { type: "jk_table", title: "JK Perancangan Strategik Operasi (PSO)" },
    { type: "jk_table", title: "JK Mesyuarat Guru / Refleksi" },
    { type: "jk_table", title: "JK Pengurusan Pejabat" },
    { type: "simple_table", title: "Jadual Guru Bertugas Mingguan 2024/2025", sectionKey: "jadual-guru-bertugas" },
  ],
  kurikulum: [
    { type: "jk_table", title: "JM21. JK Pengurusan Kurikulum" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-1" },
    { type: "jk_table", title: "JM22. JK Panitia Mata Pelajaran" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-2" },
    { type: "jk_table", title: "JM23. JK Pentaksiran dan Peperiksaan /JK PBS" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-3" },
    { type: "jk_table", title: "JM24. JK Pusat Sumber Sekolah" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-4" },
  ],
  hem: [
    { type: "poster", title: "Carta Organisasi Pengurusan Hal Ehwal Murid", sectionKey: "carta-organisasi-hem" },
    { type: "poster", title: "Carta Organisasi Pengurusan Asrama", sectionKey: "carta-organisasi-asrama" },
    { type: "jk_table", title: "JM25 JK Pengurusan Hal Ehwal Murid" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-1" },
    { type: "jk_table", title: "JM26. JK Pengurusan Disiplin Murid" },
    { type: "jk_table", title: "JM27. JK Pengurusan 3K (Kebersihan, Kesihatan dan Keselamatan)" },
    { type: "jk_table", title: "JM28. JK Bimbingan dan Kaunseling" },
    { type: "jk_table", title: "JK Penglibatan Ibubapa Komuniti Swasta (PIBKS)" },
    { type: "jk_table", title: "JM29. JK Pengurusan Asrama" },
    { type: "jk_table", title: "JK Pengurusan Persatuan Waris (PEWARIS)" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-2" },
  ],
  kokurikulum: [
    { type: "poster", title: "Carta Organisasi Pengurusan Kokurikulum", sectionKey: "carta-organisasi-kokurikulum" },
    { type: "jk_table", title: "JM30. JK Pengurusan Kokurikulum" },
    { type: "jk_table", title: "JM31. JK Pembangunan Sukan Sekolah" },
    { type: "jk_table", title: "JM32. JK Sukan Tahunan Sekolah" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-1" },
    { type: "jk_table", title: "JM33. JK Koperasi Sekolah" },
    { type: "jk_table", title: "JK Pasukan Badan Beruniform (PBB)" },
    { type: "jk_table", title: "JK Kelab dan Persatuan Akademik" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-2" },
    { type: "jk_table", title: "JK Rancangan Integrasi Murid untuk Perpaduan (RIMUP)" },
    { type: "jk_table", title: "JK Pengurusan Kokurikulum Tambahan" },
    { type: "jk_table", title: "JK Redaksi / Majalah Sekolah" },
    { type: "jk_table", title: "JK Pengurusan Latihan Pasukan Permainan Sekolah" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-3" },
  ],
  "tingkatan-6": [
    { type: "poster", title: "Carta Organisasi Pengurusan Tingkatan Enam", sectionKey: "carta-organisasi-tingkatan-enam" },
    { type: "jk_table", title: "JM11 JK Pengurusan Tingkatan Enam" },
    { type: "simple_table", title: "Jadual Ketua Guru Bertugas Mingguan", sectionKey: "jadual-ketua-guru-bertugas" },
    { type: "jk_table", title: "JK Pengurusan Akademik Tingkatan Enam" },
    { type: "jk_table", title: "JK Pengurusan Hal Ehwal Murid Tingkatan Enam" },
    { type: "jk_table", title: "JK Pengurusan Kokurikulum Tingkatan Enam" },
    { type: "file_list", title: "Section Gdrive", sectionKey: "gdrive-1" },
  ],
};

function buildManagementTemplateSections({
  unitSlug,
  unit,
  cartaImageUrl,
  dbJkMembers,
}: {
  unitSlug: string;
  unit: (typeof UNITS)[number];
  cartaImageUrl: string | null;
  dbJkMembers: Array<{ jkCode: string; jkTitle: string; nama: string; jawatan: string; sortOrder: number }>;
}): ContentSection[] | null {
  const template = MANAGEMENT_TEMPLATE_SECTIONS[unitSlug];
  if (!template) return null;

  const dbByTitle = new Map<string, ContentItem[]>();
  const dbByCode = new Map<string, ContentItem[]>();
  for (const member of dbJkMembers) {
    const item = {
      title: member.nama,
      value: member.jawatan,
      sortOrder: member.sortOrder,
    };
    const titleKey = normalizeTitle(member.jkTitle);
    dbByTitle.set(titleKey, [...(dbByTitle.get(titleKey) ?? []), item]);
    const codeKey = extractCommitteeCode(member.jkTitle) ?? member.jkCode.toUpperCase();
    dbByCode.set(codeKey, [...(dbByCode.get(codeKey) ?? []), item]);
  }

  const fallbackByTitle = new Map<string, ContentItem[]>();
  const fallbackByCode = new Map<string, ContentItem[]>();
  for (const table of unit.jkTables ?? []) {
    const items = table.members.map((member, index) => ({
      title: member.name,
      value: member.jawatan,
      sortOrder: index,
    }));
    fallbackByTitle.set(normalizeTitle(table.title), items);
    const codeKey = extractCommitteeCode(table.title);
    if (codeKey) {
      fallbackByCode.set(codeKey, items);
    }
  }

  const kpiItems = unit.kpis.map((kpi, index) => ({
    label: kpi.label,
    value: `${kpi.value}${kpi.suffix ?? ""}`,
    sortOrder: index,
  }));

  return template.map((spec, index) => {
    const sortOrder = index * 10;
    const sectionKey = spec.sectionKey ?? slugify(spec.title);

    if (spec.type === "poster") {
      return {
        sectionKey,
        type: "poster",
        title: spec.title,
        subtitle: spec.subtitle ?? null,
        body: null,
        imageUrl: spec.imageUrl ?? (index === 0 ? cartaImageUrl : null),
        linkLabel: null,
        linkUrl: null,
        isActive: true,
        sortOrder,
        items: [],
      } satisfies ContentSection;
    }

    if (spec.type === "stats") {
      return {
        sectionKey,
        type: "stats",
        title: spec.title,
        subtitle: null,
        body: null,
        imageUrl: null,
        linkLabel: null,
        linkUrl: null,
        isActive: true,
        sortOrder,
        items: kpiItems,
      } satisfies ContentSection;
    }

    if (spec.type === "text_block") {
      return {
        sectionKey,
        type: "text_block",
        title: spec.title,
        subtitle: spec.subtitle ?? null,
        body: spec.body ?? null,
        imageUrl: null,
        linkLabel: spec.linkLabel ?? null,
        linkUrl: spec.linkUrl ?? null,
        isActive: true,
        sortOrder,
        items: [],
      } satisfies ContentSection;
    }

    if (spec.type === "file_list") {
      return {
        sectionKey,
        type: "file_list",
        title: spec.title,
        subtitle: spec.subtitle ?? "Akses dokumen berkaitan melalui integrasi Google Drive.",
        body: null,
        imageUrl: null,
        linkLabel: null,
        linkUrl: null,
        unitSlug,
        isActive: true,
        sortOrder,
        items: [],
      } satisfies ContentSection;
    }

    if (spec.type === "simple_table") {
      return {
        sectionKey,
        type: "simple_table",
        title: spec.title,
        subtitle: spec.subtitle ?? null,
        body: null,
        imageUrl: null,
        linkLabel: null,
        linkUrl: null,
        isActive: true,
        sortOrder,
        items: [],
      } satisfies ContentSection;
    }

    const codeKey = extractCommitteeCode(spec.title);
    const items =
      dbByTitle.get(normalizeTitle(spec.title))
      ?? (codeKey ? dbByCode.get(codeKey) : undefined)
      ?? fallbackByTitle.get(normalizeTitle(spec.title))
      ?? (codeKey ? fallbackByCode.get(codeKey) : undefined)
      ?? [];

    return {
      sectionKey,
      type: "jk_table",
      title: spec.title,
      subtitle: null,
      body: null,
      imageUrl: null,
      linkLabel: null,
      linkUrl: null,
      isActive: true,
      sortOrder,
      items,
    } satisfies ContentSection;
  });
}

async function defaultUnitSections(unitSlug: string): Promise<ContentSection[]> {
  const unit = UNITS.find((row) => row.slug === unitSlug);
  if (!unit) return [];

  const [uploadedDocs, dbJkMembers] = await Promise.all([
    db
      .select()
      .from(unitDocuments)
      .where(eq(unitDocuments.unitSlug, unitSlug))
      .orderBy(asc(unitDocuments.sortOrder), asc(unitDocuments.createdAt)),
    db
      .select()
      .from(unitJkMembers)
      .where(eq(unitJkMembers.unitSlug, unitSlug))
      .orderBy(asc(unitJkMembers.jkCode), asc(unitJkMembers.sortOrder)),
  ]);

  const carta = uploadedDocs.find((row) => row.type === "carta-org");
  const managementTemplate = buildManagementTemplateSections({
    unitSlug,
    unit,
    cartaImageUrl: carta?.fileUrl ?? null,
    dbJkMembers,
  });
  if (managementTemplate) {
    return managementTemplate;
  }

  const fileItems = unit.dokumen?.map((doc, index) => {
    const uploaded = uploadedDocs.find((row) => row.type === "dokumen" && row.label === doc.label);
    return {
      label: doc.label,
      title: doc.label,
      body: doc.desc ?? null,
      fileUrl: uploaded?.fileUrl ?? null,
      value: uploaded ? "Tersedia" : "Belum tersedia",
      sortOrder: index,
      createdAt: uploaded?.createdAt ?? null,
    };
  }) ?? [];

  const dbJkSections: ContentSection[] = [];
  if (dbJkMembers.length > 0) {
    const grouped = new Map<string, typeof dbJkMembers>();
    for (const member of dbJkMembers) {
      if (!grouped.has(member.jkCode)) grouped.set(member.jkCode, []);
      grouped.get(member.jkCode)!.push(member);
    }
    let jkSortIndex = 0;
    for (const [jkCode, members] of grouped) {
      dbJkSections.push({
        sectionKey: `jk-${jkCode}`,
        type: "jk_table",
        jkCode,
        title: members[0].jkTitle,
        isActive: true,
        sortOrder: 30 + jkSortIndex,
        items: members.map((m, i) => ({ title: m.nama, value: m.jawatan, sortOrder: i })),
      });
      jkSortIndex++;
    }
  }

  const toJkCode = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const jkSections: ContentSection[] = dbJkSections.length > 0
    ? dbJkSections
    : (unit.jkTables?.map((table, index) => ({
        sectionKey: `jk-${index + 1}`,
        type: "jk_table" as const,
        jkCode: toJkCode(table.title),
        title: table.title,
        isActive: true,
        sortOrder: 30 + index,
        items: table.members.map((member, memberIndex) => ({
          title: member.name,
          value: member.jawatan,
          sortOrder: memberIndex,
        })),
      })) ?? []);

  return [
    {
      sectionKey: "carta-organisasi",
      type: "poster",
      title: `Carta Organisasi ${unit.title}`,
      subtitle: "Struktur organisasi unit.",
      imageUrl: carta?.fileUrl ?? null,
      isActive: true,
      sortOrder: 0,
      items: [],
    },
    {
      sectionKey: "kpi",
      type: "stats",
      title: unit.slug === "pentadbiran" ? "Hala Tuju 2026-2030" : `KPI ${unit.title}`,
      isActive: true,
      sortOrder: 10,
      items: unit.kpis.map((kpi, index) => ({
        label: kpi.label,
        value: `${kpi.value}${kpi.suffix ?? ""}`,
        sortOrder: index,
      })),
    },
    ...(unitSlug === "pentadbiran"
      ? [
          {
            sectionKey: "log-harian-pengetua",
            type: "text_block" as const,
            title: "Log Harian Pengetua",
            subtitle: null,
            body: "Akses dan semak maklumat log harian, perancangan strategik, takwim pengurusan, serta pelan pentadbiran pengetua sekolah secara interaktif melalui paparan Canva.",
            imageUrl: null,
            linkLabel: "Buka Log Harian Pengetua",
            linkUrl: "https://pengurusandanpentadbiran.my.canva.site/plannerpengetua",
            isActive: true,
            sortOrder: 15,
            items: [],
          },
        ]
      : []),
    ...(unit.pencapaian?.length
      ? [
          {
            sectionKey: "program-pencapaian",
            type: "card_grid" as const,
            title: `Program & Pencapaian ${unit.title}`,
            isActive: true,
            sortOrder: 20,
            items: unit.pencapaian.map((item, index) => ({
              title: item.title,
              body: item.desc,
              sortOrder: index,
            })),
          },
        ]
      : []),
    ...jkSections,
    {
      sectionKey: "dokumen",
      type: "file_list" as const,
      title: `Dokumen ${unit.title}`,
      subtitle: "Dokumen dan fail unit.",
      unitSlug,
      isActive: true,
      sortOrder: 60,
      items: fileItems,
    },
  ];
}

export const getPublicContent = cache(async (pageKey: string): Promise<ContentSection[]> => {
  try {
    const rows = await db
      .select()
      .from(publicContent)
      .where(eq(publicContent.pageKey, pageKey))
      .orderBy(asc(publicContent.sortOrder), asc(publicContent.createdAt));

    if (!rows.length) {
      if (pageKey === "home") return defaultHomeSections(await getSettings());
      if (pageKey === "about") return defaultAboutSections();
      if (pageKey === "asrama") return defaultAsramaSections();
      return [];
    }

    const itemRows = await db
      .select()
      .from(publicContentItems)
      .where(inArray(publicContentItems.contentId, rows.map((row) => row.id)))
      .orderBy(asc(publicContentItems.sortOrder), asc(publicContentItems.createdAt));

    return withItems(rows, itemRows, "contentId").filter((section) => section.isActive);
  } catch {
    if (pageKey === "home") return defaultHomeSections(await getSettings());
    if (pageKey === "about") return defaultAboutSections();
    if (pageKey === "asrama") return defaultAsramaSections();
    return [];
  }
});

export const getUnitSections = cache(async (unitSlug: string): Promise<ContentSection[]> => {
  try {
    const defaults = await defaultUnitSections(unitSlug);

    const rows = await db
      .select()
      .from(unitSections)
      .where(eq(unitSections.unitSlug, unitSlug))
      .orderBy(asc(unitSections.sortOrder), asc(unitSections.createdAt));

    if (!rows.length) {
      return defaults;
    }

    const itemRows = await db
      .select()
      .from(unitSectionItems)
      .where(inArray(unitSectionItems.sectionId, rows.map((row) => row.id)))
      .orderBy(asc(unitSectionItems.sortOrder), asc(unitSectionItems.createdAt));

    const rowById = new Map(rows.map((row) => [row.id, row]));
    const dbSections = withItems(rows, itemRows, "sectionId")
      .filter((section) => section.isActive)
      .map((section) => {
        const row = section.id ? rowById.get(section.id) : undefined;
        return {
          ...section,
          unitSlug: row?.unitSlug ?? unitSlug,
          jkCode:
            section.type === "jk_table" && section.sectionKey.startsWith("jk-")
              ? section.sectionKey.slice(3)
              : null,
        };
      });

    dbSections.sort((a, b) => a.sortOrder - b.sortOrder);
    return dbSections;
  } catch {
    return defaultUnitSections(unitSlug);
  }
});

export async function getPublicContentSection(pageKey: string, sectionKey: string): Promise<ContentSection | null> {
  const sections = await getPublicContent(pageKey);
  return sections.find((section) => section.sectionKey === sectionKey) ?? null;
}

export async function getUnitContentSection(unitSlug: string, sectionKey: string): Promise<ContentSection | null> {
  const sections = await getUnitSections(unitSlug);
  return sections.find((section) => section.sectionKey === sectionKey) ?? null;
}
