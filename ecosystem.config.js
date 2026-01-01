module.exports = {
  apps: [
    {
      name: "video-meta-generate",
      script: "npm",
      args: "start",
      cwd: "/srv/apps/video-meta-generate/current",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "1G",
      min_uptime: "10s",
      max_restarts: 10,
      watch: false,
      ignore_watch: ["node_modules", ".next", "logs"],
    },
  ],
};

