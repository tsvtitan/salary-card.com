FROM tsvtitan/salary-card.com:0.0.3-import

MAINTAINER tsv.titan@gmail.com

ADD start.sh /start.sh

RUN chmod +x /*.sh

EXPOSE 22 1337 2812 6379 27017

ENTRYPOINT ["/start.sh"]  

