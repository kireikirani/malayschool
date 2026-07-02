# Source Inventory

## Sources
- Legacy database export
- Legacy uploaded media folder
- Legacy static page content
- Legacy admin users
- Legacy route list or sitemap

## Target domains
- `site_settings`
- `user`
- `account`
- `session`
- `verification`
- `media`
- `teachers`
- `advertisements`
- `pengumuman`
- `news`
- `gallery_albums`
- `gallery_items`
- `asrama_pelajar`
- `unit_documents`
- `public_content`
- `public_content_items`
- `unit_sections`
- `unit_section_items`

## Required outputs
- Field mapping sheet
- Redirect map
- Cutover checklist
- Rollback notes

## Freeze checklist
- Legacy content edits frozen: pending
- Legacy uploads frozen: pending
- Legacy admin account freeze date: pending
- Final export owner: pending

## Domain mapping notes
- `site_settings`: school profile, KPI stats, PIBG banking info, countdown date, contact details
- `user` and auth tables: admin-only import unless legacy password hashes are confirmed compatible
- `media`: normalize file path, file key, folder, mime type, and file size before insert
- `teachers`: preserve `status`, biography, and photo path
- `advertisements`: preserve `placement`, `type`, schedule windows, and active state
- `pengumuman`: map image URL, external link, expiry, and sort order
- `news`: preserve `slug`, publication status, publication date, SEO metadata, and author linkage
- `gallery_albums` and `gallery_items`: keep album grouping and item order
- `asrama_pelajar`: preserve dorm, guardian, gender, and active state
- `unit_documents`: preserve `unitSlug`, document type, label, file URL, and year
- `public_content` and `unit_sections`: preserve section keys, section order, item order, and rich content payloads
