import { Card, CardContent } from "./ui/Card";
import { Activity } from "lucide-react";

export function Orders() {
  return (
    <div className="flex-1 p-8 space-y-6 bg-slate-50 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Orders</h1>
        <p className="text-slate-500 font-medium">Monitor ongoing processing for presriptions</p>
      </div>

      <Card className="mt-8 border-dashed border-2 border-slate-200 bg-slate-50/50">
        <CardContent className="flex flex-col items-center justify-center py-20">
            <Activity className="w-16 h-16 text-slate-300 mb-4" />
            <div className="text-lg font-bold text-slate-700">No Active Orders</div>
            <p className="text-sm text-slate-500 max-w-sm text-center mt-2">
                When new prescription requests or refils are submitted, they will appear securely in this queue for fulfillment.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
