// app/admin/dashboard/page.tsx

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Users, FileText, MapPinned } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Người dùng</p>
            <p className="text-2xl font-bold">1,250</p>
          </div>
          <Users className="h-6 w-6 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Bài viết Blog</p>
            <p className="text-2xl font-bold">320</p>
          </div>
          <FileText className="h-6 w-6 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Tour đã đăng</p>
            <p className="text-2xl font-bold">78</p>
          </div>
          <MapPinned className="h-6 w-6 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Tăng trưởng</p>
            <p className="text-2xl font-bold">+18%</p>
          </div>
          <ArrowUpRight className="h-6 w-6 text-green-500" />
        </CardContent>
      </Card>
    </div>
  );
}
