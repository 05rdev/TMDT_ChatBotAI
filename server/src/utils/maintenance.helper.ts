import fs from 'fs';
import path from 'path';

const configPath = path.join(__dirname, '../config/maintenance.json');

class MaintenanceHelper {
  private static isMaintenanceEnabled: boolean = false;

  static init() {
    try {
      if (fs.existsSync(configPath)) {
        const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.isMaintenanceEnabled = !!data.enabled;
      } else {
        // Ensure config directory exists
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false }), 'utf8');
        this.isMaintenanceEnabled = false;
      }
    } catch (error) {
      console.error('Failed to load maintenance config:', error);
      this.isMaintenanceEnabled = false;
    }
  }

  static isEnabled(): boolean {
    return this.isMaintenanceEnabled;
  }

  static setEnabled(enabled: boolean) {
    this.isMaintenanceEnabled = enabled;
    try {
      fs.writeFileSync(configPath, JSON.stringify({ enabled }), 'utf8');
    } catch (error) {
      console.error('Failed to save maintenance config:', error);
    }
  }
}

// Initialize on load
MaintenanceHelper.init();

export { MaintenanceHelper };
