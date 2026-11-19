# 🍳 GHÉP ĐỒ TFT (MÙA 18: ENCHANTED WILDS)

Website tĩnh học cách ghép trang bị game Đấu Trường Chân Lý (Teamfight Tactics) Mùa 18 – **Enchanted Wilds (Khu Rừng Kỳ Bí)** theo phong cách bài tập "Nối Chữ" tiểu học với giao diện vở ô ly vui tươi, thân thiện.

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **4 Chế Độ Học & Chơi Độc Đáo:**
   - 🎮 **Nối Ảnh (Chế độ chính):** 3 cột (Mảnh 1 – Mảnh 2 – Đồ hoàn chỉnh). Vẽ đường nối cong SVG mềm mại, hỗ trợ kéo thả chuột và cảm ứng trên điện thoại. Nối đúng phát âm thanh vui tai + đường xanh phát sáng; nối sai rung nhẹ màu đỏ.
   - 📖 **Bảng Công Thức (Tra cứu & Học):** Lưới 10 nguyên liệu cơ bản, bấm chọn 1 nguyên liệu để thấy ngay toàn bộ đồ ghép được từ nó; tích hợp ô tìm kiếm và chip lọc theo hệ/sát thương.
   - 🔄 **Nối Ngược:** Cho trước đồ hoàn chỉnh, đố người chơi chọn đúng 2 mảnh ghép để rèn luyện trí nhớ phản xạ.
   - 📝 **Ôn Tập (Spaced Repetition):** Tự động lưu lại các câu người chơi hay nối sai vào `localStorage` và ưu tiên đưa vào danh sách ôn tập.

2. **Dữ Liệu Chuẩn TFT (Patch 18.7):**
   - **8 Nguyên liệu cơ bản:** Kiếm B.F, Cung Gỗ, Gậy Quá Khổ, Nước Mắt Nữ Thần, Giáp Lưới, Áo Choàng Bạc, Đai Khổng Lồ, Găng Đấu Tập.
   - **36 Trang bị hoàn chỉnh:** Vô Cực Kiếm, Diệt Khổng Lồ, **Trượng Hư Vô (Cung + Nước Mắt)**, Bùa Đỏ, Quỷ Thư Morello, Giáp Gai, Vuốt Rồng, Cuồng Đao Guinsoo, Nanh Nashor, Trái Tim Kiên Định...
   - **Hình ảnh chính thức trong game:** 100% icon đồ họa PNG chính thức được tải trực tiếp từ Riot Games CDN (Data Dragon & CommunityDragon).
   - Tổng cộng: **44 vật phẩm** (8 nguyên liệu + 36 trang bị hoàn chỉnh).

3. **Nội Dung Giáo Dục Dành Riêng Cho Người Mới:**
   - Thẻ giải thích chi tiết: Chỉ số, Nội tại diễn giải bằng tiếng Việt bình dân, dễ hiểu (không thuật ngữ phức tạp).
   - Gợi ý "Khi nào nên dùng" (loại tướng nào hợp, khi nào nên ghép và khi nào nên tránh).
   - Câu "Mẹo nhớ công thức" vần điệu vui nhộn giúp nhớ bài nhanh.
   - Âm thanh sống động bằng Web Audio API thuần (không phụ thuộc file mp3 ngoài).

---

## 📁 CẤU TRÚC THƯ MỤC

```text
vibecode/
├── index.html                   # Giao diện chính của website
├── data/
│   └── items.json               # Toàn bộ dữ liệu trang bị Mùa 18 (chuẩn JSON)
├── public/
│   ├── css/
│   │   └── style.css            # Giao diện phong cách vở ô ly, responsive
│   ├── js/
│   │   ├── sound.js             # Bộ tổng hợp âm thanh Web Audio API
│   │   ├── data.js              # Quản lý dữ liệu và LocalStorage ôn tập
│   │   ├── app.js               # Điều phối ứng dụng, tab, điểm số, popup
│   │   └── modes/
│   │       ├── match.js         # Logic chế độ Nối Ảnh (vẽ dây SVG)
│   │       ├── learn.js         # Logic chế độ Bảng Công Thức
│   │       ├── reverse.js       # Logic chế độ Nối Ngược
│   │       └── review.js        # Logic chế độ Ôn Tập
│   └── img/
│       └── items/               # Thư mục lưu trữ hình ảnh icon trang bị
├── scripts/
│   └── fetch-data.py            # Script tự động tải dữ liệu và cập nhật patch mới
└── README.md                    # Hướng dẫn chi tiết sử dụng và deploy
```

---

## 🔄 CẬP NHẬT DỮ LIỆU KHI CÓ PATCH MỚI

Khi Riot Games ra mắt phiên bản mới, chỉ cần chạy lại lệnh sau để tự động cập nhật:

```bash
# Chạy bằng Python 3
python scripts/fetch-data.py
```
Script sẽ tự động:
1. Kết nối đến Riot Data Dragon và CommunityDragon để kiểm tra thông số.
2. Cập nhật file `data/items.json`.
3. Tải các icon mới về thư mục `public/img/items/`.

---

# 🚀 HƯỚNG DẪN ĐƯA WEBSITE LÊN INTERNET (DÀNH CHO NGƯỜI MỚI BẮT ĐẦU)

Dưới đây là 2 cách chi tiết nhất từ con số 0 để đưa trang web lên mạng cho bạn bè hoặc cộng đồng cùng chơi.

---

## CÁCH A: MIỄN PHÍ VÀ DỄ NHẤT (GITHUB PAGES HOẶC CLOUDFLARE PAGES / NETLIFY)

### Bước 1: Cài đặt Git và chuẩn bị mã nguồn
Nếu máy tính của bạn chưa có Git, hãy tải tại [git-scm.com](https://git-scm.com/) và cài đặt.

Mở terminal (PowerShell trên Windows hoặc Terminal trên Mac/Linux), chuyển vào thư mục dự án và gõ các lệnh sau:

```bash
# 1. Khởi tạo kho lưu trữ Git cục bộ
git init

# 2. Đưa toàn bộ các file dự án vào danh sách theo dõi
git add .

# 3. Tạo một commit đầu tiên lưu lại phiên bản này
git commit -m "Phiên bản đầu tiên của web Ghép Đồ TFT Mùa 18"
```

### Bước 2: Đẩy code lên GitHub
1. Truy cập [github.com](https://github.com/) và đăng nhập tài khoản.
2. Bấm nút **New Repository** (màu xanh lá ở góc trên bên phải).
3. Đặt tên Repo, ví dụ: `ghep-do-tft`. Chọn chế độ **Public**, sau đó bấm **Create repository**.
4. GitHub sẽ hiển thị đường link repo của bạn (ví dụ: `https://github.com/username/ghep-do-tft.git`). Hãy chạy 3 lệnh sau trong terminal:

```bash
# Đổi tên nhánh chính thành main
git branch -M main

# Liên kết thư mục trên máy với GitHub (thay URL bằng repo của bạn)
git remote add origin https://github.com/username/ghep-do-tft.git

# Đẩy code lên GitHub
git push -u origin main
```

---

### Bước 3: Bật trang web (Chọn 1 trong 3 nền tảng miễn phí)

#### Lựa chọn A.1: GitHub Pages (Đơn giản nhất, không cần đăng ký thêm gì)
1. Trong trang repo của bạn trên GitHub, vào tab **Settings** (ở thanh menu trên).
2. Ở cột bên trái, bấm vào mục **Pages**.
3. Tại phần **Build and deployment** -> **Branch**:
   - Chọn nhánh: `main`.
   - Chọn thư mục: `/ (root)`.
   - Bấm **Save**.
4. Đợi khoảng 1–2 phút, bạn sẽ nhận được đường link web miễn phí có dạng:  
   `https://username.github.io/ghep-do-tft/`

#### Lựa chọn A.2: Cloudflare Pages (Tốc độ tải cực nhanh tại Việt Nam)
1. Đăng ký/đăng nhập tài khoản tại [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Chọn mục **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Chọn repo `ghep-do-tft` của bạn.
4. Ở phần **Build settings**:
   - Framework preset: Chọn **None**.
   - Build output directory: Để trống hoặc ghi `./`.
5. Bấm **Save and Deploy**. Website của bạn sẽ chạy trên tên miền `*.pages.dev`.

#### Trỏ tên miền riêng (Nếu bạn đã mua tên miền như `.vn`, `.com`):
- Vào trang quản lý của GitHub Pages hoặc Cloudflare Pages -> Tìm mục **Custom domains**.
- Nhập tên miền của bạn (ví dụ `ghepdotft.com`).
- Vào nhà cung cấp tên miền của bạn (Namecheap, GoDaddy, Pavietnam, Matbao...), tạo bản ghi CNAME trỏ về `username.github.io` (hoặc CNAME của Cloudflare). Hệ thống sẽ tự động cấp chứng chỉ bảo mật HTTPS (SSL) miễn phí!

---

## CÁCH B: TỰ CÓ VPS RIÊNG (UBUNTU LINUX + NGINX + HTTPS LET'S ENCRYPT)

Dành cho bạn đã thuê máy chủ ảo VPS chạy hệ điều hành **Ubuntu 20.04 / 22.04 / 24.04 LTS**.

### Bước 1: Cài đặt máy chủ web Nginx trên VPS
Đăng nhập vào VPS qua SSH:
```bash
ssh root@IP_CỦA_VPS
```

Chạy lệnh cập nhật hệ thống và cài đặt Nginx:
```bash
# Cập nhật danh sách gói
sudo apt update && sudo apt upgrade -y

# Cài đặt Nginx
sudo apt install nginx -y

# Cho phép Nginx đi qua tường lửa UFW
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Bước 2: Tải mã nguồn lên VPS
Tạo thư mục chứa web trên VPS:
```bash
sudo mkdir -p /var/www/ghep-do-tft
```

Có 2 cách đưa code lên:
- **Cách dùng Git (Khuyên dùng):**
  ```bash
  cd /var/www/ghep-do-tft
  git clone https://github.com/username/ghep-do-tft.git .
  ```
- **Cách dùng lệnh `rsync` hoặc `scp` từ máy cá nhân:**
  ```bash
  # Chạy lệnh này từ máy tính của bạn:
  rsync -avz --exclude='.git' ./ root@IP_CỦA_VPS:/var/www/ghep-do-tft/
  ```

Phân quyền chuẩn cho thư mục web:
```bash
sudo chown -R www-data:www-data /var/www/ghep-do-tft
sudo chmod -R 755 /var/www/ghep-do-tft
```

### Bước 3: Cấu hình Server Block (Virtual Host) của Nginx
Tạo file cấu hình mới:
```bash
sudo nano /etc/nginx/sites-available/ghep-do-tft
```

Dán nội dung sau (thay `yourdomain.com` bằng tên miền hoặc IP của bạn):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com; # Hoặc điền IP VPS nếu chưa có tên miền

    root /var/www/ghep-do-tft;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Bật nén Gzip giúp tải trang nhanh hơn
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Lưu cache tĩnh cho ảnh và css
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
}
```
Lưu lại bằng cách nhấn `Ctrl + O` -> `Enter`, sau đó nhấn `Ctrl + X` để thoát.

Kích hoạt cấu hình và khởi động lại Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/ghep-do-tft /etc/nginx/sites-enabled/
# Xóa cấu hình mặc định nếu không dùng:
sudo rm -f /etc/nginx/sites-enabled/default

# Kiểm tra cú pháp xem có lỗi không
sudo nginx -t

# Nạp lại cấu hình Nginx
sudo systemctl reload nginx
```

### Bước 4: Bật bảo mật HTTPS miễn phí với Certbot (Let's Encrypt)
Chỉ áp dụng khi bạn đã trỏ tên miền về IP của VPS:
```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx -y

# Tự động lấy chứng chỉ SSL và cấu hình Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot sẽ tự động gia hạn chứng chỉ khi sắp hết hạn. Lúc này truy cập `https://yourdomain.com` sẽ có biểu tượng ổ khóa xanh an toàn!

### Bước 5: Cập nhật web khi có patch TFT mới trên VPS
Khi có patch mới, bạn chỉ cần thực hiện 3 bước đơn giản:
```bash
cd /var/www/ghep-do-tft

# 1. Kéo code mới về nếu dùng git
git pull origin main

# 2. Hoặc chạy script tải dữ liệu mới trực tiếp trên VPS
python3 scripts/fetch-data.py

# 3. Phân quyền lại cho thư mục
sudo chown -R www-data:www-data /var/www/ghep-do-tft
```

---

## ⚖️ BẢN QUYỀN VÀ MIỄN TRỪ TRÁCH NHIỆM

- Dữ liệu và hình ảnh trang bị thuộc quyền sở hữu của **Riot Games**.
- Trang web này là sản phẩm phi thương mại do cộng đồng người hâm mộ phát triển với mục đích giáo dục, hỗ trợ người mới tiếp cận game Đấu Trường Chân Lý (TFT).
- Các đánh giá và gợi ý trang bị mang tính tham khảo tổng quan, meta và thông số trang bị có thể thay đổi tùy thuộc vào các bản cân bằng tiếp theo của Riot Games.

