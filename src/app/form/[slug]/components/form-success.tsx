// SimpleCRM — form-success
import { CheckCircle } from "lucide-react";

export function FormSuccess() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-12 text-center animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto">
      <div className="flex justify-center mb-8">
        <div className="size-20 rounded-full bg-purple-50 flex items-center justify-center shadow-inner">
          <CheckCircle className="h-12 w-12 text-purple-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Successful!</h2>
      <p className="text-gray-500 font-medium leading-relaxed">
        Thank you for your interest. We have received your information and our team will be in touch with you shortly.
      </p>
      <div className="mt-8 pt-8 border-t border-gray-100">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          SimpleCRM Protected Submission
        </p>
      </div>
    </div>
  );
}

