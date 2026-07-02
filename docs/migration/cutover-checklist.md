# Cutover Checklist

## Before cutover
- Freeze legacy writes
- Export final database snapshot
- Export final media snapshot
- Run full migration in staging
- Review row counts against source inventory
- Confirm redirect map is ready

## During cutover
- Run production backup
- Run schema sync only if required
- Run migration loaders in order
- Run verification report
- Run route smoke checks
- Spot check admin login and downloads

## After cutover
- Check admin login
- Check uploads
- Check file downloads
- Check 404 logs
- Keep rollback window active

## Production order
1. Freeze legacy writes
2. Capture DB backup
3. Capture media backup
4. Run schema sync if required
5. Run migration loaders
6. Run verification
7. Run smoke checks
8. Enable traffic
9. Monitor 404s and admin flows

## Staging rehearsal log
- Started at:
- Completed at:
- Failed steps:
- Manual interventions:
- Follow-up fixes:
