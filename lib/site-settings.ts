import { cache } from "react";
import { db } from "@/lib/db";
import { siteSettings } from "@/db/schema";
import * as brand from "@/lib/brand";
import type { ThemeColor } from "@/lib/theme";

export type SiteSettings = {
  schoolName: string;
  schoolTagline: string;
  schoolVision: string;
  schoolMission: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolFax: string;
  schoolAddress: string;
  schoolWhatsapp: string;
  statsStudents: number;
  statsSupportStaff: number;
  statsClasses: number;
  statsSpmCandidates: number;
  pibgAccountName: string;
  pibgBankName: string;
  pibgAccountNumber: string;
  pibgQrImageUrl: string;
  spmDate: string;
  themeColor: ThemeColor;
  asramaPassword?: string;
  pentadbiranPassword?: string;
  googleAppsScriptUrl?: string;
  googleDriveFolderId?: string;
  homeAnnouncementsEyebrow: string;
  homeAnnouncementsTitle: string;
  homeAnnouncementsLinkLabel: string;
  homeAnnouncementsEmptyTitle: string;
  homeAnnouncementsEmptyBody: string;
  homeNewsEyebrow: string;
  homeNewsTitle: string;
  homeNewsLinkLabel: string;
  homeNewsEmptyMessage: string;
  homeCountdownEyebrow: string;
  homeCountdownTitle: string;
  homeCountdownPastTitle: string;
  homeCountdownQuote: string;
  homeCountdownDaysLabel: string;
  homeCountdownHoursLabel: string;
  homeCountdownMinutesLabel: string;
  homeCountdownSecondsLabel: string;
};

const DEFAULTS: SiteSettings = {
  schoolName: brand.SCHOOL_NAME,
  schoolTagline: brand.SCHOOL_TAGLINE,
  schoolVision: brand.SCHOOL_VISION,
  schoolMission: brand.SCHOOL_VISION,
  schoolPhone: brand.SCHOOL_PHONE,
  schoolEmail: brand.SCHOOL_EMAIL,
  schoolFax: brand.SCHOOL_FAX,
  schoolAddress: brand.SCHOOL_ADDRESS,
  schoolWhatsapp: brand.SCHOOL_WHATSAPP_URL,
  statsStudents: brand.SCHOOL_STATS.students,
  statsSupportStaff: brand.SCHOOL_STATS.supportStaff,
  statsClasses: brand.SCHOOL_STATS.classes,
  statsSpmCandidates: brand.SCHOOL_STATS.spmCandidates,
  pibgAccountName: brand.PIBG_ACCOUNT_NAME,
  pibgBankName: brand.PIBG_BANK_NAME,
  pibgAccountNumber: brand.PIBG_ACCOUNT_NUMBER,
  pibgQrImageUrl: "",
  spmDate: brand.SCHOOL_SPM_DATE,
  themeColor: "navy",
  asramaPassword: "PENTADBIRAN2026",
  pentadbiranPassword: "PENTADBIRAN2026",
  googleAppsScriptUrl: "",
  googleDriveFolderId: "",
  homeAnnouncementsEyebrow: "Terkini",
  homeAnnouncementsTitle: "Info & Pengumuman",
  homeAnnouncementsLinkLabel: "Lihat semua berita",
  homeAnnouncementsEmptyTitle: "Belum ada poster info terkini",
  homeAnnouncementsEmptyBody: "Admin boleh menambah poster melalui menu Pengumuman.",
  homeNewsEyebrow: "Berita & Pengumuman",
  homeNewsTitle: "Perkembangan Terkini Sekolah",
  homeNewsLinkLabel: "Lihat semua berita",
  homeNewsEmptyMessage: "Belum ada berita.",
  homeCountdownEyebrow: "Kiraan Masa",
  homeCountdownTitle: "Menghitung Hari ke SPM",
  homeCountdownPastTitle: "SPM Telah Bermula",
  homeCountdownQuote: "Belajar bersungguh-sungguh. Kejayaan anda adalah kebanggaan kami.",
  homeCountdownDaysLabel: "Hari",
  homeCountdownHoursLabel: "Jam",
  homeCountdownMinutesLabel: "Minit",
  homeCountdownSecondsLabel: "Saat",
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await db.select().from(siteSettings);
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;

    return {
      schoolName: map.schoolName ?? DEFAULTS.schoolName,
      schoolTagline: map.schoolTagline ?? DEFAULTS.schoolTagline,
      schoolVision: map.schoolVision ?? DEFAULTS.schoolVision,
      schoolMission: map.schoolMission ?? DEFAULTS.schoolMission,
      schoolPhone: map.schoolPhone ?? DEFAULTS.schoolPhone,
      schoolEmail: map.schoolEmail ?? DEFAULTS.schoolEmail,
      schoolFax: map.schoolFax ?? DEFAULTS.schoolFax,
      schoolAddress: map.schoolAddress ?? DEFAULTS.schoolAddress,
      schoolWhatsapp: map.schoolWhatsapp ?? DEFAULTS.schoolWhatsapp,
      statsStudents: map.statsStudents ? Number(map.statsStudents) : DEFAULTS.statsStudents,
      statsSupportStaff: map.statsSupportStaff ? Number(map.statsSupportStaff) : DEFAULTS.statsSupportStaff,
      statsClasses: map.statsClasses ? Number(map.statsClasses) : DEFAULTS.statsClasses,
      statsSpmCandidates: map.statsSpmCandidates ? Number(map.statsSpmCandidates) : DEFAULTS.statsSpmCandidates,
      pibgAccountName: map.pibgAccountName ?? DEFAULTS.pibgAccountName,
      pibgBankName: map.pibgBankName ?? DEFAULTS.pibgBankName,
      pibgAccountNumber: map.pibgAccountNumber ?? DEFAULTS.pibgAccountNumber,
      pibgQrImageUrl: map.pibgQrImageUrl ?? DEFAULTS.pibgQrImageUrl,
      spmDate: map.spmDate ?? DEFAULTS.spmDate,
      themeColor: (map.themeColor as ThemeColor) ?? DEFAULTS.themeColor,
      asramaPassword: map.asramaPassword ?? DEFAULTS.asramaPassword,
      pentadbiranPassword: map.pentadbiranPassword ?? DEFAULTS.pentadbiranPassword,
      googleAppsScriptUrl: map.googleAppsScriptUrl ?? DEFAULTS.googleAppsScriptUrl,
      googleDriveFolderId: map.googleDriveFolderId ?? DEFAULTS.googleDriveFolderId,
      homeAnnouncementsEyebrow: map.homeAnnouncementsEyebrow ?? DEFAULTS.homeAnnouncementsEyebrow,
      homeAnnouncementsTitle: map.homeAnnouncementsTitle ?? DEFAULTS.homeAnnouncementsTitle,
      homeAnnouncementsLinkLabel: map.homeAnnouncementsLinkLabel ?? DEFAULTS.homeAnnouncementsLinkLabel,
      homeAnnouncementsEmptyTitle: map.homeAnnouncementsEmptyTitle ?? DEFAULTS.homeAnnouncementsEmptyTitle,
      homeAnnouncementsEmptyBody: map.homeAnnouncementsEmptyBody ?? DEFAULTS.homeAnnouncementsEmptyBody,
      homeNewsEyebrow: map.homeNewsEyebrow ?? DEFAULTS.homeNewsEyebrow,
      homeNewsTitle: map.homeNewsTitle ?? DEFAULTS.homeNewsTitle,
      homeNewsLinkLabel: map.homeNewsLinkLabel ?? DEFAULTS.homeNewsLinkLabel,
      homeNewsEmptyMessage: map.homeNewsEmptyMessage ?? DEFAULTS.homeNewsEmptyMessage,
      homeCountdownEyebrow: map.homeCountdownEyebrow ?? DEFAULTS.homeCountdownEyebrow,
      homeCountdownTitle: map.homeCountdownTitle ?? DEFAULTS.homeCountdownTitle,
      homeCountdownPastTitle: map.homeCountdownPastTitle ?? DEFAULTS.homeCountdownPastTitle,
      homeCountdownQuote: map.homeCountdownQuote ?? DEFAULTS.homeCountdownQuote,
      homeCountdownDaysLabel: map.homeCountdownDaysLabel ?? DEFAULTS.homeCountdownDaysLabel,
      homeCountdownHoursLabel: map.homeCountdownHoursLabel ?? DEFAULTS.homeCountdownHoursLabel,
      homeCountdownMinutesLabel: map.homeCountdownMinutesLabel ?? DEFAULTS.homeCountdownMinutesLabel,
      homeCountdownSecondsLabel: map.homeCountdownSecondsLabel ?? DEFAULTS.homeCountdownSecondsLabel,
    };
  } catch {
    return DEFAULTS;
  }
});
