import AdminDashboardContent, {
  type AdminDashboardData,
} from "@/components/admin/AdminDashboardContent";

type DashboardPanelProps = {
  data: AdminDashboardData;
};

export default function DashboardPanel({ data }: DashboardPanelProps) {
  return <AdminDashboardContent data={data} />;
}
