export function printRollbackNotes() {
  console.log("Rollback inputs:");
  console.log("- pre-cutover database snapshot");
  console.log("- pre-cutover media archive");
  console.log("- redirect map backup");
}

printRollbackNotes();
