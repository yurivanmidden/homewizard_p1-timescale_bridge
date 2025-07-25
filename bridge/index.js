const fetch = require('node-fetch');
const { Client } = require('pg');

const P1_METER_URL = process.env.P1_METER_URL || 'http://10.13.13.2/api/v1/data';
const POLL_INTERVAL = process.env.POLL_INTERVAL || 1000; // ms

const pgClient = new Client({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'timescaledb',
  database: process.env.PGDATABASE || 'p1meter',
  password: process.env.PGPASSWORD || 'yourpassword',
  port: 5432,
});

async function pollAndStore() {
  try {
    const res = await fetch(P1_METER_URL);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();

    // Example: extract relevant fields (adjust to your actual API response)
    const timestamp = new Date();
    const total_power_import_kwh = data.total_power_import_kwh || null;
    const total_power_export_kwh = data.total_power_export_kwh || null;
    const active_power_w = data.active_power_w || null;
    const active_power_l1_w = data.active_power_l1_w || null;
    const active_power_l2_w = data.active_power_l2_w || null;
    const active_power_l3_w = data.active_power_l3_w || null;
    const active_voltage_l1_v = data.active_voltage_l1_v || null;
    const active_voltage_l2_v = data.active_voltage_l2_v || null;
    const active_voltage_l3_v = data.active_voltage_l3_v || null;
    const active_current_l1_a = data.active_current_l1_a || null;
    const active_current_l2_a = data.active_current_l2_a || null;
    const active_current_l3_a = data.active_current_l3_a || null;
    const active_frequency_hz = data.active_frequency_hz || null;

    await pgClient.query(
      `INSERT INTO meter_data (
        time,
        total_power_import_kwh,
        total_power_export_kwh,
        active_power_w,
        active_power_l1_w,
        active_power_l2_w,
        active_power_l3_w,
        active_voltage_l1_v,
        active_voltage_l2_v,
        active_voltage_l3_v,
        active_current_l1_a,
        active_current_l2_a,
        active_current_l3_a,
        active_frequency_hz,
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        timestamp, 
        total_power_import_kwh,
        total_power_export_kwh,
        active_power_w,
        active_power_l1_w,
        active_power_l2_w,
        active_power_l3_w,
        active_voltage_l1_v,
        active_voltage_l2_v,
        active_voltage_l3_v,
        active_current_l1_a,
        active_current_l2_a,
        active_current_l3_a,
        active_frequency_hz,
      ]
    );
    console.log(`[${timestamp.toISOString()}] Data stored: ${active_power_w}W`);
  } catch (err) {
    console.error('Polling error:', err.message);
  }
}

async function main() {
  await pgClient.connect();
  setInterval(pollAndStore, POLL_INTERVAL);
}

main();