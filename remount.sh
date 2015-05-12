#!/bin/sh

echo "Unmounting..."

umount -f /Users/tsv/salary-card.com/www

echo "Mounting..."

echo "t6)uDUgy" | sshfs root@salary-card.com:/www /Users/tsv/salary-card.com/www -p 50022 -o cache=no -o reconnect -o volname=salary-card.com -o password_stdin

echo "Done."