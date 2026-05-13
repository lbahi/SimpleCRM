// SimpleCRM — form-success
import { CheckCircle } from "lucide-react";

export function FormSuccess() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-neutral-900">You're all set!</h2>
      <p className="mt-2 text-neutral-500">
        Thanks for reaching out. We'll be in touch soon.
      </p>
    </div>
  );
}
