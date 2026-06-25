import { TeacherForm } from "../_components/teacher-form";

export default function NewTeacherPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tambah Guru</h1>
      <TeacherForm />
    </div>
  );
}
