#!/bin/bash

cat export/export.tar | docker import - tsvtitan/salary-card.com:0.0.3-import