#!/bin/bash

function tearDown {

    echo "Finished."
    exit 0
}

#trap tearDown SIGNINT SIGNUP SIGNTERM
trap tearDown 1 2 15

echo "Starting..."

service monit stop

monit -d 10 -I -v