#!/bin/sh

SC_DIR=`dirname $0`
SC_DIR_LEN=${#SC_DIR}
SC_SCRIPT=$1
SC_SCRIPT=${SC_SCRIPT:SC_DIR_LEN}

export SC_DIR
export SC_SCRIPT

function tearDown {

    $SC_DIR/www-stop.sh $SC_SCRIPT
    exit 0
}

trap tearDown 0 1 2 3 6 9 15

#echo ${#SC_DIR}
#echo $SC_SCRIPT

/usr/local/bin/sshpass -p 't6)uDUgy' ssh root@salary-card.com -p 50022 /www-start.sh $SC_SCRIPT
