# Phân Loại Địa Giới Hành Chính & Cấu Trúc VIEW Table

Tài liệu này hướng dẫn chi tiết cách chuẩn hóa địa chỉ (`address`) từ bảng `businesses` sang các đơn vị hành chính cấp xã (Phường/Xã/Thị trấn) và cấp huyện (Quận/Huyện/Thành phố) thuộc tỉnh Bà Rịa - Vũng Tàu và khu vực lân cận, tích hợp giữa các địa danh cũ và đơn vị hành chính mới theo các nghị quyết sắp xếp năm 2025.

Đồng thời, cấu trúc VIEW table `v_businesses_classified` đã được khởi tạo trực tiếp trên database Neon.

---

## 1. Thông Tin VIEW Table
* **Tên VIEW**: `v_businesses_classified`
* **Mục đích**: Mở rộng bảng `businesses` bằng cách bổ sung thêm 2 trường dữ liệu động:
  * `ward_commune`: Xã/Phường/Thị trấn được trích xuất và chuẩn hóa từ cột `address`.
  * `district_city`: Quận/Huyện/Thị xã/Thành phố tương ứng.
* **Cột bổ sung**: Đã bao gồm cột `region` nguyên bản từ `businesses` để phục vụ lọc vùng trong API và Frontend.
* **Ứng dụng**: Phục vụ trực tiếp cho loader API hoặc bộ lọc (`FilterBar`) trên giao diện Dashboard mà không cần xử lý chuỗi phức tạp ở phía client.

---

## 2. Bối Cảnh Địa Giới Hành Chính Mới (2025)
Các quy tắc phân loại trong VIEW này tuân thủ các thay đổi địa giới hành chính mới nhất của tỉnh Bà Rịa - Vũng Tàu:
1. **Thành phố Vũng Tàu (Hiệu lực 01/01/2025)**: 
   * **Phường Vũng Tàu**: Sáp nhập Phường 1, 2, 3, 4, 5, Thắng Nhì, Thắng Tam.
   * **Phường Tam Thắng**: Sáp nhập Phường 7, 8, 9 và Nguyễn An Ninh.
   * **Phường Rạch Dừa**: Sáp nhập Phường 10, Thắng Nhất, Rạch Dừa cũ.
   * **Phường Phước Thắng**: Sáp nhập Phường 11 và Phường 12.
2. **Thành phố Phú Mỹ (Hiệu lực 01/03/2025)**:
   * Nâng cấp từ Thị xã Phú Mỹ (trước đây là Huyện Tân Thành).
   * Thành lập mới **Phường Tân Hải** và **Phường Tân Hòa** trên cơ sở hai xã cũ tương ứng.
3. **Huyện Châu Đức (Hiệu lực 01/01/2025)**:
   * Thành lập **Thị trấn Kim Long** trên cơ sở nguyên trạng xã Kim Long.
4. **Huyện Long Đất (Hiệu lực 01/01/2025)**:
   * Thành lập trên cơ sở sáp nhập toàn bộ diện tích và dân số của **Huyện Long Điền** và **Huyện Đất Đỏ**.
   * Thành lập **Xã Tam An** trên cơ sở sáp nhập xã An Nhứt, An Ngãi, và Tam Phước.

---

## 3. SQL Script Tạo VIEW (`v_businesses_classified`)

Dưới đây là mã nguồn SQL được sử dụng để khởi tạo VIEW:

```sql
CREATE OR REPLACE VIEW v_businesses_classified AS
WITH cleaned_step1 AS (
  SELECT 
    *,
    -- 1. Chuyển chữ thường và xóa tỉnh Bà Rịa Vũng Tàu
    regexp_replace(
      lower(address),
      'ba\s*ria\s*[-–—]?\s*vung\s*tau(\s*province)?|bà\s*rịa\s*[-–—]?\s*vũng\s*tày|bà\s*rịa\s*[-–—]?\s*vũng\s*tàu(\s*tỉnh)?|ba\s*ria\s*vung\s*tau|bà\s*rịa\s*vũng\s*tàu|brvt',
      '',
      'g'
    ) as step1
  FROM businesses
),
cleaned_step2 AS (
  SELECT
    *,
    -- 2. Xóa các tên đường cụ thể
    regexp_replace(
      regexp_replace(
        step1,
        'đường mỹ xuân\s*[-–—]\s*ngãi giao|mỹ xuân\s*[-–—]\s*ngãi giao|bình ba\s*[-–—]\s*đá bạc|hắc dịch\s*[-–—]\s*tóc tiên|đá bạc\s*[-–—]\s*long tân',
        '',
        'g'
      ),
      'đường bình giã|đường ngãi giao|đường bình ba|đường đất đỏ|đường long điền|đường long hải|đường phước hưng|đường hòa hiệp|đường tóc tiên|đường châu pha|đường hắc dịch|đường phú mỹ|ấp phước trung',
      '',
      'g'
    ) as step2
  FROM cleaned_step1
),
cleaned_step3 AS (
  SELECT
    *,
    -- 3. Xử lý các ngoại lệ chéo
    regexp_replace(
      regexp_replace(
        step2,
        -- Nếu địa chỉ chứa "long điền", loại bỏ "long sơn" tránh trùng lặp
        CASE WHEN step2 ~* 'long điền|long dien' THEN 'long sơn|long son' ELSE 'placeholder_no_match' END,
        '',
        'g'
      ),
      -- Nếu địa chỉ chứa "phú mỹ / tân thành", loại bỏ "tam thắng" tránh trùng lặp
      CASE WHEN step2 ~* 'phú mỹ|tân thành|phu my|tan thanh' THEN 'tam thắng|tam thang' ELSE 'placeholder_no_match' END,
      '',
      'g'
    ) as cleaned_address
  FROM cleaned_step2
)
SELECT 
  id,
  search_keyword,
  business_name,
  phone,
  website,
  address,
  category,
  region,
  rating,
  review_count,
  maps_url,
  review_image_urls,
  status,
  scraped_at,
  created_at,
  is_corrected,
  
  -- 1. Phân loại Xã/Phường/Thị trấn (ward_commune) dựa trên cleaned_address
  CASE 
    -- 1. THÀNH PHỐ HỒ CHÍ MINH (Đặc trưng)
    WHEN cleaned_address ~* '\y(tân bình|bình tân|củ chi|bà điểm|âu cơ|bảy hiền|cư xá bắc hải|phú thọ hòa|bình trị đông|tôn thất hiệp|rạch bùng bình|bình thới|lạc long quân|bình đông|phú định|dân trí|gò ô môi|đoàn nguyễn tuấn|tân sơn nhất|xóm chiếu|tôn thất thuyết|chợ quán|bình hưng|bùi dương lịch)\y'
      THEN 'Thành phố Hồ Chí Minh'

    -- 2. THÀNH PHỐ VŨNG TÀU (vung_tau)
    WHEN cleaned_address ILIKE '%tam thắng%' OR cleaned_address ILIKE '%tam thang%' OR cleaned_address ILIKE '%nguyễn an ninh%' OR cleaned_address ILIKE '%nguyen an ninh%' OR cleaned_address ~* '\yphường 7\y' OR cleaned_address ~* '\yphuong 7\y' OR cleaned_address ~* '\yphường 8\y' OR cleaned_address ~* '\yphuong 8\y' OR cleaned_address ~* '\yphường 9\y' OR cleaned_address ~* '\yphuong 9\y' OR cleaned_address ILIKE '%lê văn lộc%'
      THEN 'Phường Tam Thắng'
    WHEN cleaned_address ILIKE '%rạch dừa%' OR cleaned_address ILIKE '%rach dua%' OR cleaned_address ILIKE '%thắng nhất%' OR cleaned_address ILIKE '%thang nhat%' OR cleaned_address ~* '\yphường 10\y' OR cleaned_address ~* '\yphuong 10\y'
      THEN 'Phường Rạch Dừa'
    WHEN cleaned_address ILIKE '%phước thắng%' OR cleaned_address ILIKE '%phuoc thang%' OR cleaned_address ~* '\yphường 11\y' OR cleaned_address ~* '\yphuong 11\y' OR cleaned_address ~* '\yphường 12\y' OR cleaned_address ~* '\yphuong 12\y'
      THEN 'Phường Phước Thắng'
    WHEN cleaned_address ~* '\yphường 1\y' OR cleaned_address ~* '\yphuong 1\y' OR cleaned_address ~* '\yphường 2\y' OR cleaned_address ~* '\yphuong 2\y' OR cleaned_address ~* '\yphường 3\y' OR cleaned_address ~* '\yphuong 3\y' OR cleaned_address ~* '\yphường 4\y' OR cleaned_address ~* '\yphuong 4\y' OR cleaned_address ~* '\yphường 5\y' OR cleaned_address ~* '\yphuong 5\y' OR cleaned_address ILIKE '%thắng nhì%' OR cleaned_address ILIKE '%thang nhi%' OR cleaned_address ILIKE '%thắng tam%' OR cleaned_address ILIKE '%thang tam%' OR
         cleaned_address ILIKE '%chí linh%' OR cleaned_address ILIKE '%chi linh%' OR cleaned_address ILIKE '%bãi sau%' OR cleaned_address ILIKE '%bãi trước%'
      THEN 'Phường Vũng Tàu'
    WHEN cleaned_address ILIKE '%long sơn%' OR cleaned_address ILIKE '%long son%'
      THEN 'Xã Long Sơn'
    WHEN cleaned_address ILIKE '%vũng tàu%' OR cleaned_address ILIKE '%vung tau%'
      THEN 'Thành phố Vũng Tàu (Chưa rõ phường/xã)'

    -- 3. THÀNH PHỐ PHÚ MỸ (phu_my)
    WHEN cleaned_address ILIKE '%tân phước%' OR cleaned_address ILIKE '%tan phuoc%' 
      THEN 'Phường Tân Phước'
    WHEN cleaned_address ILIKE '%mỹ xuân%' OR cleaned_address ILIKE '%my xuan%' 
      THEN 'Phường Mỹ Xuân'
    WHEN cleaned_address ILIKE '%hắc dịch%' OR cleaned_address ILIKE '%hac dich%' 
      THEN 'Phường Hắc Dịch'
    WHEN cleaned_address ILIKE '%phước hòa%' OR cleaned_address ILIKE '%phuoc hoa%' 
      THEN 'Phường Phước Hòa'
    WHEN cleaned_address ILIKE '%tân hải%' OR cleaned_address ILIKE '%tan hai%' 
      THEN 'Phường Tân Hải'
    WHEN cleaned_address ILIKE '%tân hòa%' OR cleaned_address ILIKE '%tan hoa%' 
      THEN 'Phường Tân Hòa'
    WHEN cleaned_address ILIKE '%châu pha%' OR cleaned_address ILIKE '%chau pha%' 
      THEN 'Xã Châu Pha'
    WHEN cleaned_address ILIKE '%tóc tiên%' OR cleaned_address ILIKE '%toc tien%' 
      THEN 'Xã Tóc Tiên'
    WHEN cleaned_address ILIKE '%sông xoài%' OR cleaned_address ILIKE '%song xoai%' 
      THEN 'Xã Sông Xoài'
    WHEN cleaned_address ILIKE '%phú mỹ%' OR cleaned_address ILIKE '%phu my%' 
      THEN 'Phường Phú Mỹ'
    WHEN cleaned_address ILIKE '%tân thành%' OR cleaned_address ILIKE '%tan thanh%'
      THEN 'Thành phố Phú Mỹ (Chưa rõ phường/xã)'

    -- 4. THÀNH PHỐ BÀ RỊA (ba_ria)
    WHEN cleaned_address ILIKE '%long hương%' OR cleaned_address ILIKE '%long huong%' 
      THEN 'Phường Long Hương'
    WHEN cleaned_address ILIKE '%phước nguyên%' OR cleaned_address ILIKE '%phuoc nguyen%' 
      THEN 'Phường Phước Nguyên'
    WHEN cleaned_address ILIKE '%phước trung%' OR cleaned_address ILIKE '%phuoc trung%' OR cleaned_address ILIKE '%phước hiệp%' OR cleaned_address ILIKE '%phuoc hiep%'
      THEN 'Phường Phước Trung'
    WHEN cleaned_address ILIKE '%long toàn%' OR cleaned_address ILIKE '%long toan%' 
      THEN 'Phường Long Toàn'
    WHEN cleaned_address ILIKE '%long tâm%' OR cleaned_address ILIKE '%long tam%' OR cleaned_address ILIKE '%tam long%' 
      THEN 'Phường Long Tâm'
    WHEN cleaned_address ILIKE '%kim dinh%' 
      THEN 'Phường Kim Dinh'
    WHEN cleaned_address ILIKE '%phước hưng%' OR cleaned_address ILIKE '%phuoc hung%' 
      THEN 'Phường Phước Hưng'
    WHEN cleaned_address ILIKE '%hòa long%' OR cleaned_address ILIKE '%hoa long%' 
      THEN 'Xã Hòa Long'
    WHEN cleaned_address ILIKE '%long phước%' OR cleaned_address ILIKE '%long phuoc%' 
      THEN 'Xã Long Phước'
    WHEN cleaned_address ILIKE '%tân hưng%' OR cleaned_address ILIKE '%tan hung%' 
      THEN 'Xã Tân Hưng'
    WHEN cleaned_address ILIKE '%bà rịa%' OR cleaned_address ILIKE '%ba ria%'
      THEN 'Thành phố Bà Rịa (Chưa rõ phường/xã)'

    -- 5. HUYỆN CHÂU ĐỨC (chau_duc)
    WHEN cleaned_address ILIKE '%ngãi giao%' OR cleaned_address ILIKE '%ngai giao%' 
      THEN 'Thị trấn Ngãi Giao'
    WHEN cleaned_address ILIKE '%kim long%' 
      THEN 'Thị trấn Kim Long'
    WHEN cleaned_address ILIKE '%bình giã%' OR cleaned_address ILIKE '%binh gia%' 
      THEN 'Xã Bình Giã'
    WHEN cleaned_address ILIKE '%nghĩa thành%' OR cleaned_address ILIKE '%nghia thanh%' 
      THEN 'Xã Nghĩa Thành'
    WHEN cleaned_address ILIKE '%suối nghệ%' OR cleaned_address ILIKE '%suoi nghe%' 
      THEN 'Xã Suối Nghệ'
    WHEN cleaned_address ILIKE '%đá bạc%' OR cleaned_address ILIKE '%da bac%' 
      THEN 'Xã Đá Bạc'
    WHEN cleaned_address ILIKE '%láng lớn%' OR cleaned_address ILIKE '%lang lon%' 
      THEN 'Xã Láng Lớn'
    WHEN cleaned_address ILIKE '%xuân sơn%' OR cleaned_address ILIKE '%xuan son%' 
      THEN 'Xã Xuân Sơn'
    WHEN cleaned_address ILIKE '%xà bang%' OR cleaned_address ILIKE '%xa bang%' 
      THEN 'Xã Xà Bang'
    WHEN cleaned_address ILIKE '%châu đức%' OR cleaned_address ILIKE '%chau duc%'
      THEN 'Huyện Châu Đức (Chưa rõ xã/thị trấn)'

    -- 6. HUYỆN LONG ĐẤT (long_dat)
    WHEN cleaned_address ILIKE '%long hải%' OR cleaned_address ILIKE '%long hai%'
      THEN 'Thị trấn Long Hải'
    WHEN cleaned_address ILIKE '%long điền%' OR cleaned_address ILIKE '%long dien%'
      THEN 'Thị trấn Long Điền'
    WHEN cleaned_address ILIKE '%đất đỏ%' OR cleaned_address ILIKE '%dat do%'
      THEN 'Thị trấn Đất Đỏ'
    WHEN cleaned_address ILIKE '%phước hải%' OR cleaned_address ILIKE '%phuoc hai%'
      THEN 'Thị trấn Phước Hải'
    WHEN cleaned_address ILIKE '%tam an%' OR cleaned_address ILIKE '%an nhứt%' OR cleaned_address ILIKE '%an nhut%' OR cleaned_address ILIKE '%an ngãi%' OR cleaned_address ILIKE '%an ngai%' OR cleaned_address ILIKE '%tam phước%' OR cleaned_address ILIKE '%tam phuoc%'
      THEN 'Xã Tam An'
    WHEN cleaned_address ILIKE '%phước tỉnh%' OR cleaned_address ILIKE '%phuoc tinh%'
      THEN 'Xã Phước Tỉnh'
    WHEN cleaned_address ILIKE '%phước long thọ%' OR cleaned_address ILIKE '%phuoc long tho%'
      THEN 'Xã Phước Long Thọ'
    WHEN cleaned_address ILIKE '%láng dài%' OR cleaned_address ILIKE '%lang dai%'
      THEN 'Xã Láng Dài'
    WHEN cleaned_address ILIKE '%phước hưng%' OR cleaned_address ILIKE '%phuoc hung%'
      THEN 'Xã Phước Hưng'

    -- 7. HUYỆN XUYÊN MỘC (xuyen_moc)
    WHEN cleaned_address ILIKE '%hòa hiệp%' OR cleaned_address ILIKE '%hoa hiep%'
      THEN 'Xã Hòa Hiệp'
    WHEN cleaned_address ILIKE '%hồ tràm%' OR cleaned_address ILIKE '%ho tram%' OR cleaned_address ILIKE '%phước thuận%' OR cleaned_address ILIKE '%phuoc thuan%'
      THEN 'Xã Phước Thuận (Hồ Tràm)'
    WHEN cleaned_address ILIKE '%phước bửu%' OR cleaned_address ILIKE '%phuoc buu%'
      THEN 'Thị trấn Phước Bửu'
    WHEN cleaned_address ILIKE '%hòa hội%' OR cleaned_address ILIKE '%hoa hoi%'
      THEN 'Xã Hòa Hội'
    WHEN cleaned_address ILIKE '%hòa hưng%' OR cleaned_address ILIKE '%hoa hung%'
      THEN 'Xã Hòa Hưng'
    WHEN cleaned_address ILIKE '%bàu lâm%' OR cleaned_address ILIKE '%bau lam%'
      THEN 'Xã Bàu Lâm'
    WHEN cleaned_address ILIKE '%bình châu%' OR cleaned_address ILIKE '%binh chau%'
      THEN 'Xã Bình Châu'
    WHEN cleaned_address ILIKE '%xuyên mộc%' OR cleaned_address ILIKE '%xuyen moc%'
      THEN 'Xã Xuyên Mộc'

    -- 8. TỈNH ĐỒNG NAI
    WHEN cleaned_address ILIKE '%phước thái%' OR cleaned_address ILIKE '%phuoc thai%'
      THEN 'Xã Phước Thái (Huyện Long Thành)'
    WHEN cleaned_address ILIKE '%sông ray%' OR cleaned_address ILIKE '%song ray%'
      THEN 'Xã Sông Ray (Huyện Cẩm Mỹ)'
    WHEN cleaned_address ILIKE '%xuân đông%' OR cleaned_address ILIKE '%xuan dong%'
      THEN 'Xã Xuân Đông (Huyện Cẩm Mỹ)'
    WHEN cleaned_address ILIKE '%xuân đường%' OR cleaned_address ILIKE '%xuan duong%' OR cleaned_address ILIKE '%suối quýt%'
      THEN 'Xã Xuân Đường (Huyện Cẩm Mỹ)'
    WHEN cleaned_address ILIKE '%đồng nai%' OR cleaned_address ILIKE '%dong nai%' OR cleaned_address ILIKE '%cẩm mỹ%' OR cleaned_address ILIKE '%cam my%'
      THEN 'Tỉnh Đồng Nai (Chưa rõ xã)'

    -- 9. Fallback HCM
    WHEN cleaned_address ILIKE '%hồ chí minh%' OR cleaned_address ILIKE '%ho chi minh%' OR cleaned_address ILIKE '%sài gòn%' OR cleaned_address ILIKE '%sai gon%'
      THEN 'Thành phố Hồ Chí Minh'

    ELSE 'Địa bàn khác / Chưa phân loại'
  END as ward_commune,
  
  -- 2. Phân loại Quận/Huyện/Thành phố (district_city) dựa trên cleaned_address
  CASE 
    -- 1. Tỉnh/Thành phố khác trước (Đồng Nai & HCM)
    WHEN cleaned_address ILIKE '%đồng nai%' OR cleaned_address ILIKE '%dong nai%' 
      THEN 'Tỉnh Đồng Nai'
      
    WHEN cleaned_address ~* '\y(tân bình|bình tân|củ chi|bà điểm|âu cơ|bảy hiền|cư xá bắc hải|phú thọ hòa|bình trị đông|tôn thất hiệp|rạch bùng bình|bình thới|lạc long quân|bình đông|phú định|dân trí|gò ô môi|đoàn nguyễn tuấn|tân sơn nhất|xóm chiếu|tôn thất thuyết|chợ quán|bình hưng|bùi dương lịch)\y'
      THEN 'Thành phố Hồ Chí Minh'

    -- 2. Thành phố Vũng Tàu (vung_tau)
    WHEN cleaned_address ILIKE '%vũng tàu%' OR cleaned_address ILIKE '%vung_tau%' OR cleaned_address ILIKE '%vung tau%'
         OR cleaned_address ILIKE '%tam thắng%' OR cleaned_address ILIKE '%tam thang%'
         OR cleaned_address ILIKE '%rạch dừa%' OR cleaned_address ILIKE '%rach dua%'
         OR cleaned_address ILIKE '%phước thắng%' OR cleaned_address ILIKE '%phuoc thang%'
         OR cleaned_address ILIKE '%long sơn%' OR cleaned_address ILIKE '%long son%'
         OR cleaned_address ILIKE '%thắng nhất%' OR cleaned_address ILIKE '%thang nhat%'
         OR cleaned_address ILIKE '%thắng nhì%' OR cleaned_address ILIKE '%thang nhi%'
         OR cleaned_address ILIKE '%thắng tam%' OR cleaned_address ILIKE '%thang tam%'
         OR cleaned_address ILIKE '%nguyễn an ninh%' OR cleaned_address ILIKE '%chí linh%'
         OR cleaned_address ILIKE '%bãi sau%' OR cleaned_address ILIKE '%bãi trước%'
         OR cleaned_address ~* '\y(phường 1|phường 2|phường 3|phường 4|phường 5|phường 7|phường 8|phường 9|phường 10|phường 11|phường 12)\y'
         OR cleaned_address ~* '\y(phuong 1|phuong 2|phuong 3|phuong 4|phuong 5|phuong 7|phuong 8|phuong 9|phuong 10|phuong 11|phuong 12)\y'
      THEN 'Thành phố Vũng Tàu'

    -- 3. Thành phố Phú Mỹ (Tân Thành)
    WHEN cleaned_address ILIKE '%phú mỹ%' OR cleaned_address ILIKE '%phu my%' OR cleaned_address ILIKE '%tân thành%' OR cleaned_address ILIKE '%tan thanh%'
         OR cleaned_address ILIKE '%tân phước%' OR cleaned_address ILIKE '%tan phuoc%'
         OR cleaned_address ILIKE '%mỹ xuân%' OR cleaned_address ILIKE '%my xuan%'
         OR cleaned_address ILIKE '%hắc dịch%' OR cleaned_address ILIKE '%hac dich%'
         OR cleaned_address ILIKE '%phước hòa%' OR cleaned_address ILIKE '%phuoc hoa%'
         OR cleaned_address ILIKE '%tân hải%' OR cleaned_address ILIKE '%tan hai%'
         OR cleaned_address ILIKE '%tân hòa%' OR cleaned_address ILIKE '%tan hoa%'
         OR cleaned_address ILIKE '%châu pha%' OR cleaned_address ILIKE '%chau pha%'
         OR cleaned_address ILIKE '%tóc tiên%' OR cleaned_address ILIKE '%toc tien%'
         OR cleaned_address ILIKE '%sông xoài%' OR cleaned_address ILIKE '%song xoai%'
      THEN 'Thành phố Phú Mỹ'

    -- 4. Thành phố Bà Rịa
    WHEN cleaned_address ILIKE '%bà rịa%' OR cleaned_address ILIKE '%ba ria%' OR cleaned_address ILIKE '%long hương%' OR cleaned_address ILIKE '%long huong%'
         OR cleaned_address ILIKE '%phước nguyên%' OR cleaned_address ILIKE '%phuoc nguyen%' OR cleaned_address ILIKE '%phước trung%' OR cleaned_address ILIKE '%phuoc trung%'
         OR cleaned_address ILIKE '%phước hiệp%' OR cleaned_address ILIKE '%phuoc hiep%' OR cleaned_address ILIKE '%long toàn%' OR cleaned_address ILIKE '%long toan%'
         OR cleaned_address ILIKE '%long tâm%' OR cleaned_address ILIKE '%long tam%' OR cleaned_address ILIKE '%tam long%' OR cleaned_address ILIKE '%kim dinh%'
         OR cleaned_address ILIKE '%hòa long%' OR cleaned_address ILIKE '%hoa long%' OR cleaned_address ILIKE '%long phước%' OR cleaned_address ILIKE '%long phuoc%'
         OR cleaned_address ILIKE '%tân hưng%' OR cleaned_address ILIKE '%tan hung%'
      THEN 'Thành phố Bà Rịa'

    -- 5. Huyện Châu Đức
    WHEN cleaned_address ILIKE '%châu đức%' OR cleaned_address ILIKE '%chau duc%' OR cleaned_address ILIKE '%ngãi giao%' OR cleaned_address ILIKE '%ngai giao%'
         OR cleaned_address ILIKE '%kim long%' OR cleaned_address ILIKE '%bình giã%' OR cleaned_address ILIKE '%binh gia%'
         OR cleaned_address ILIKE '%nghĩa thành%' OR cleaned_address ILIKE '%nghia thanh%' OR cleaned_address ILIKE '%suối nghệ%' OR cleaned_address ILIKE '%suoi nghe%'
         OR cleaned_address ILIKE '%đá bạc%' OR cleaned_address ILIKE '%da bac%' OR cleaned_address ILIKE '%láng lớn%' OR cleaned_address ILIKE '%lang lon%'
         OR cleaned_address ILIKE '%xuân sơn%' OR cleaned_address ILIKE '%xuan son%' OR cleaned_address ILIKE '%xà bang%' OR cleaned_address ILIKE '%xa bang%'
      THEN 'Huyện Châu Đức'

    -- 6. Huyện Long Đất (Long Điền & Đất Đỏ)
    WHEN cleaned_address ILIKE '%long đất%' OR cleaned_address ILIKE '%long dat%' OR cleaned_address ILIKE '%long điền%' OR cleaned_address ILIKE '%long dien%'
         OR cleaned_address ILIKE '%đất đỏ%' OR cleaned_address ILIKE '%dat do%' OR cleaned_address ILIKE '%long hải%' OR cleaned_address ILIKE '%long hai%'
         OR cleaned_address ILIKE '%phước hải%' OR cleaned_address ILIKE '%phuoc hai%' OR cleaned_address ILIKE '%tam an%' OR cleaned_address ILIKE '%an nhứt%'
         OR cleaned_address ILIKE '%an ngãi%' OR cleaned_address ILIKE '%tam phước%' OR cleaned_address ILIKE '%phước tỉnh%' OR cleaned_address ILIKE '%phước long thọ%'
         OR cleaned_address ILIKE '%láng dài%' OR cleaned_address ILIKE '%phước hưng%'
      THEN 'Huyện Long Đất'

    -- 7. Huyện Xuyên Mộc
    WHEN cleaned_address ILIKE '%xuyên mộc%' OR cleaned_address ILIKE '%xuyen moc%' OR cleaned_address ILIKE '%hồ tràm%' OR cleaned_address ILIKE '%ho tram%'
         OR cleaned_address ILIKE '%phước thuận%' OR cleaned_address ILIKE '%phuoc thuan%' OR cleaned_address ILIKE '%phước bửu%' OR cleaned_address ILIKE '%phuoc buu%'
         OR cleaned_address ILIKE '%hòa hiệp%' OR cleaned_address ILIKE '%hoa hiep%' OR cleaned_address ILIKE '%hòa hội%' OR cleaned_address ILIKE '%hoa hoi%'
         OR cleaned_address ILIKE '%hòa hưng%' OR cleaned_address ILIKE '%hoa hung%' OR cleaned_address ILIKE '%bàu lâm%' OR cleaned_address ILIKE '%bau lam%'
         OR cleaned_address ILIKE '%bình châu%' OR cleaned_address ILIKE '%binh chau%'
      THEN 'Huyện Xuyên Mộc'

    -- 8. Fallback
    WHEN cleaned_address ILIKE '%hồ chí minh%' OR cleaned_address ILIKE '%ho chi minh%' OR cleaned_address ILIKE '%sài gòn%' OR cleaned_address ILIKE '%sai gon%'
      THEN 'Thành phố Hồ Chí Minh'

    ELSE 'Địa bàn khác / Chưa phân loại'
  END as district_city
FROM cleaned_step3;
```

---

## 4. Kết Quả Thống Kê Phân Bố Doanh Nghiệp Từ VIEW

Truy vấn SQL thống kê:
```sql
SELECT 
  district_city,
  ward_commune,
  count(*) as business_count
FROM v_businesses_classified
GROUP BY 1, 2
ORDER BY 1, 3 DESC;
```

Bảng kết quả phân bố tổng cộng **544** dòng dữ liệu:

| Quận/Huyện/Thành phố (`district_city`) | Xã/Phường/Thị trấn (`ward_commune`) | Số lượng DN |
| :--- | :--- | :---: |
| **Huyện Châu Đức** | Thị trấn Ngãi Giao | 40 |
| | Thị trấn Kim Long | 25 |
| | Xã Bình Giã | 10 |
| | Xã Nghĩa Thành | 9 |
| | Huyện Châu Đức (Chưa rõ xã/thị trấn) | 5 |
| | Xã Xà Bang | 1 |
| | Xã Láng Lớn | 1 |
| | Xã Xuân Sơn | 1 |
| **Huyện Long Đất** | Thị trấn Long Hải | 16 |
| | Thị trấn Long Điền | 16 |
| | Thị trấn Đất Đỏ | 11 |
| | Xã Phước Hưng | 1 |
| **Huyện Xuyên Mộc** | Xã Phước Thuận (Hồ Tràm) | 18 |
| | Xã Bàu Lâm | 7 |
| | Xã Xuyên Mộc | 6 |
| | Xã Hòa Hội | 5 |
| | Xã Hòa Hiệp | 1 |
| **Thành phố Bà Rịa** | Thành phố Bà Rịa (Chưa rõ phường/xã) | 25 |
| | Phường Long Tâm | 15 |
| | Phường Long Hương | 6 |
| **Thành phố Hồ Chí Minh** | Thành phố Hồ Chí Minh | 22 |
| **Thành phố Phú Mỹ** | Phường Phú Mỹ | 66 |
| | Phường Tân Phước | 13 |
| | Xã Châu Pha | 12 |
| | Thành phố Phú Mỹ (Chưa rõ phường/xã) | 9 |
| | Phường Tân Hải | 6 |
| | Phường Mỹ Xuân | 4 |
| **Thành phố Vũng Tàu** | Phường Tam Thắng | 65 |
| | Thành phố Vũng Tàu (Chưa rõ phường/xã) | 49 |
| | Phường Rạch Dừa | 32 |
| | Phường Phước Thắng | 18 |
| | Xã Long Sơn | 2 |
| **Tỉnh Đồng Nai** | Xã Phước Thái (Huyện Long Thành) | 13 |
| | Xã Sông Ray (Huyện Cẩm Mỹ) | 4 |
| | Xã Xuân Đông (Huyện Cẩm Mỹ) | 4 |
| | Xã Long Phước | 3 |
| | Tỉnh Đồng Nai (Chưa rõ xã) | 2 |
| | Xã Xuân Đường (Huyện Cẩm Mỹ) | 1 |
| **Tổng cộng** | | **544** |
