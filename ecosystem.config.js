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
        },
    ],
};