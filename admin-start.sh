#!/bin/sh

SC_HOME=`dirname $0`

export SC_HOME

function tearDown {

    $SC_HOME/admin-stop.sh
    exit 0
}

trap tearDown 0 1 2 3 6 9 15

/usr/local/bin/sshpass -p 't6)uDUgy' ssh root@salary-card.com -p 50022 /admin-start.sh
