export interface ApiResponse<T = unknown> {
  success: boolean; // Trạng thái thành công hay thất bại
  data?: T; // Dữ liệu trả về (optional, chỉ có khi success: true)
  message?: string; // Thông báo (thành công hoặc lỗi)
  statusCode: number; // Mã trạng thái HTTP (200, 400, 404, 500, v.v.)
}