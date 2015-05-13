#!/bin/sh

echo "Unmounting..."

SC_HOME=`dirname $0`

umount -f $SC_HOME/www

echo "Mounting..."

echo "t6)uDUgy" | sshfs root@salary-card.com:/www $SC_HOME/www -p 50022 -o cache=no -o reconnect -o volname=salary-card.com -o password_stdin

echo "Done."