const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

// Bản đồ các loại định dạng tệp (MIME types) phổ biến
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Hàm tự động quét các ảnh trong thư mục images và cập nhật dữ liệu menu_data.json
function generateMenuData() {
    try {
        if (!fs.existsSync(IMAGES_DIR)) {
            console.error(`[ERROR] Không tìm thấy thư mục ảnh: ${IMAGES_DIR}`);
            return;
        }

        const files = fs.readdirSync(IMAGES_DIR);
        const numFiles = [];

        // Lọc ra các file ảnh có tên là số
        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
                const nameWithoutExt = path.basename(file, ext);
                // Kiểm tra xem tên có phải là số nguyên không
                if (/^\d+$/.test(nameWithoutExt)) {
                    numFiles.push({
                        name: nameWithoutExt,
                        num: parseInt(nameWithoutExt, 10),
                        file: file
                    });
                }
            }
        });

        // Sắp xếp các ảnh theo thứ tự số tăng dần
        numFiles.sort((a, b) => a.num - b.num);

        const pages = [];
        let order = 1;

        // 1. Tìm ảnh bìa trước (bắt đầu bằng dau.)
        const dauFile = files.find(f => {
            const lower = f.toLowerCase();
            return lower.startsWith('dau.') && ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(lower));
        });
        if (dauFile) {
            pages.push({
                id: 'page_dau',
                order: order++,
                type: 'image',
                image: `images/${dauFile}`,
                name: 'Trang Bìa Trước'
            });
        }

        // 2. Thêm các trang ảnh số ở giữa
        numFiles.forEach(item => {
            pages.push({
                id: `page_${item.name}`,
                order: order++,
                type: 'image',
                image: `images/${item.file}`,
                name: `Trang ${item.name}`
            });
        });

        // 3. Tìm ảnh bìa sau (bắt đầu bằng cuoi.)
        const cuoiFile = files.find(f => {
            const lower = f.toLowerCase();
            return lower.startsWith('cuoi.') && ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(lower));
        });
        if (cuoiFile) {
            pages.push({
                id: 'page_cuoi',
                order: order++,
                type: 'image',
                image: `images/${cuoiFile}`,
                name: 'Trang Bìa Sau'
            });
        }

        // Đọc lại cấu hình cũ từ menu_data.json nếu đã tồn tại để tránh ghi đè các cấu hình khác
        let siteTitle = "MỘC TÂM ĐƯỜNG massage";
        let globalBg = "images/spa_background.png";
        let globalLayout = {};

        const menuDataPath = path.join(PUBLIC_DIR, 'menu_data.json');
        if (fs.existsSync(menuDataPath)) {
            try {
                const oldData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));
                if (oldData.site_title) siteTitle = oldData.site_title;
                if (oldData.global_bg) globalBg = oldData.global_bg;
                if (oldData.global_layout) globalLayout = oldData.global_layout;
            } catch (e) {
                // Bỏ qua lỗi đọc dữ liệu cũ
            }
        }

        // Tạo chuỗi băm (hash input) độc nhất dựa trên các tệp ảnh thực tế
        let hashInput = '';
        pages.forEach(p => {
            const fullPath = path.join(PUBLIC_DIR, p.image);
            if (fs.existsSync(fullPath)) {
                const stat = fs.statSync(fullPath);
                hashInput += `${p.image}_${stat.size}_${stat.mtimeMs}|`;
            }
        });

        // Hàm băm djb2 đơn giản và hiệu quả cao để tạo chuỗi phiên bản
        let hash = 5381;
        for (let i = 0; i < hashInput.length; i++) {
            hash = (hash * 33) ^ hashInput.charCodeAt(i);
        }
        const finalHash = Math.abs(hash).toString(36);

        const menuData = {
            site_title: siteTitle,
            global_bg: globalBg,
            pages: pages,
            global_layout: globalLayout,
            version: finalHash
        };

        // Chỉ tiến hành ghi đè file nếu có sự thay đổi thực sự về phiên bản hoặc trang
        let shouldWrite = true;
        if (fs.existsSync(menuDataPath)) {
            try {
                const currentData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));
                if (currentData.version === finalHash && JSON.stringify(currentData.pages) === JSON.stringify(pages)) {
                    shouldWrite = false;
                }
            } catch (e) {
                shouldWrite = true;
            }
        }

        if (shouldWrite) {
            fs.writeFileSync(menuDataPath, JSON.stringify(menuData, null, 2), 'utf8');
            console.log(`[WATCHER] Đã cập nhật menu_data.json mới. Phiên bản: ${finalHash}. Tổng số trang: ${pages.length}`);
        }
    } catch (err) {
        console.error('[ERROR] Lỗi trong quá trình tạo dữ liệu menu:', err);
    }
}

// Chạy khởi tạo lần đầu tiên
generateMenuData();

// Thiết lập Watcher theo dõi thư mục ảnh images/
try {
    fs.watch(IMAGES_DIR, (eventType, filename) => {
        if (filename) {
            console.log(`[WATCHER] Phát hiện thay đổi trong thư mục images: ${filename} (${eventType})`);
            generateMenuData();
        }
    });
} catch (e) {
    console.warn('[WARNING] fs.watch không khởi động được, hệ thống sẽ sử dụng cơ chế fallback polling:', e);
}

// Cơ chế Polling dự phòng mỗi 5 giây để đồng bộ tuyệt đối trên Windows
setInterval(generateMenuData, 5000);

// Khởi tạo HTTP Server tĩnh phục vụ trang web và API
const server = http.createServer((req, res) => {
    if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Method Not Allowed');
    }

    // Lấy đường dẫn tệp tĩnh an toàn từ URL
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);

    // Ngăn chặn Directory Traversal (Lỗ hổng bảo mật truy cập tệp tùy ý)
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Not Found');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 SERVER MỘC TÂM ĐƯỜNG ĐÃ KHỞI CHẠY THÀNH CÔNG!`);
    console.log(`   Địa chỉ: http://localhost:${PORT}`);
    console.log(`   Nhấn Ctrl+C để dừng server.`);
    console.log(`==================================================`);
});
