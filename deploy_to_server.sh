#!/usr/bin/expect -f
set timeout 60
set user "administrator"
set ip "172.16.100.42"
set pass "admin@123"

send_user "\n=== 1. Syncing frontend dist to SAKEC server ($ip) ===\n"
spawn scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r frontend/dist/. $user@$ip:/var/www/laroche_web/frontend/dist/
expect {
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    "password:" {
        send "$pass\r"
        exp_continue
    }
    eof
}

send_user "\n=== 2. Restarting PM2 process on server ===\n"
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $user@$ip "pm2 restart all"
expect {
    "password:" {
        send "$pass\r"
        exp_continue
    }
    eof
}

send_user "\n=== Deployment Completed Successfully! ===\n"
