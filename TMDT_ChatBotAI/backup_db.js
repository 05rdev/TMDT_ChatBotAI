const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const user = 'tmdt_user';
const password = 'tmdt_password';
const db = 'tmdt_db';
const containerName = 'tmdt_db'; // Tên container docker của bạn

const date = new Date();
const timestamp = date.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
const filename = `backup_${db}_${timestamp}.sql`;

console.log(`\n==============================================`);
console.log(`  Dang tien hanh sao luu tu Docker Container: ${containerName}`);
console.log(`==============================================\n`);

try {
  // Chạy lệnh pg_dump bên trong Docker container và lấy dữ liệu
  const command = `docker exec -e PGPASSWORD=${password} ${containerName} pg_dump -U ${user} -d ${db} -F p`;
  
  console.log(`[INFO] Dang xuat du lieu...`);
  const backupBuffer = execSync(command, { maxBuffer: 1024 * 1024 * 100 }); // Cho phép tối đa 100MB
  
  // Lưu buffer thành file trên máy thật
  fs.writeFileSync(path.join(__dirname, filename), backupBuffer);

  console.log(`[SUCCESS] Sao luu thanh cong!`);
  console.log(`[FILE] ${filename}\n`);
} catch (error) {
  console.log(`[ERROR] Loi trong qua trinh sao luu!`);
  console.error(error.message);
}
