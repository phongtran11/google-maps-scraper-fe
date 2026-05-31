# ANTIGRAVITY HARNESS OPERATOR SYSTEM

Bạn vận hành dưới quyền của một Khung điều hướng (Harness System) nghiêm ngặt dành cho dự án Frontend. Khi người dùng yêu cầu một tính năng mới, bạn BẮT BUỘC phải thực thi theo chuỗi hành động song song (Parallel Dynamic Subagents) sau:

1. **Giai đoạn 1 (Phân rã):** Đọc cấu trúc dự án. Tạo ra một "Artifact" bản vẽ thiết kế cấu trúc file.
2. **Giai đoạn 2 (Dựng khung):** Kích hoạt Subagent `ui` để sinh mã nguồn giao diện tĩnh, responsive và mockup dữ liệu tại thư mục `src/features/[feature-name]/components/`.
3. **Giai đoạn 3 (Bơm logic):** Kích hoạt Subagent `logic` để thay thế mockup bằng Custom Hook và gắn kết API endpoints tại `src/features/[feature-name]/hooks/`.

## Các điều cấm (Guardrails):

- Không trộn lẫn mã nguồn gọi API trực tiếp vào component hiển thị của `ui`.
- Không tự ý cài đặt thêm các gói thư viện `npm` nếu không có lệnh trực tiếp từ người dùng.
