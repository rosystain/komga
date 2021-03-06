CREATE TABLE BOOK_METADATA_AGGREGATION
(
    CREATED_DATE       datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LAST_MODIFIED_DATE datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    RELEASE_DATE       date     NULL,
    SUMMARY            varchar  NOT NULL DEFAULT '',
    SUMMARY_NUMBER     varchar  NOT NULL DEFAULT '',
    SERIES_ID          varchar  NOT NULL PRIMARY KEY,
    FOREIGN KEY (SERIES_ID) REFERENCES SERIES (ID)
);
CREATE TABLE BOOK_METADATA_AGGREGATION_AUTHOR
(
    NAME      varchar NOT NULL,
    ROLE      varchar NOT NULL,
    SERIES_ID varchar NOT NULL,
    FOREIGN KEY (SERIES_ID) REFERENCES SERIES (ID)
);
INSERT INTO BOOK_METADATA_AGGREGATION(SERIES_ID)
SELECT ID
from SERIES;
