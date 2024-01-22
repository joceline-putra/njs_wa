module.exports = {
    apps: [
        {
            name: "PROJECT_NAME",
            script: "./server.js",
            instances: 2,
            max_memory_restart: "300M",
            // Logging
            out_file: "./_out.log",
            error_file: "./_error.log",
            merge_logs: true,
            log_date_format: "DD-MM HH:mm:ss Z",
            log_type: "json",
            // Env Specific Config
            env_production: {
                NODE_ENV: "production",
                PORT: 3030,
                exec_mode: "cluster_mode",
                watch:true,
            },
            env_development: {
                NODE_ENV: "development",
                PORT: 3030,
                watch: true,
                watch_delay: 3000,
                ignore_watch: [
                    "./node_modules",
                    "./app/views",
                    "./public",
                    "./.DS_Store",
                    "./package.json",
                    "./yarn.lock",
                    "./samples",
                    "./src"
                ],
            },
        },
    ],
};