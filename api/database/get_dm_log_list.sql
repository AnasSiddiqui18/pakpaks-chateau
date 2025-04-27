DELIMITER //
CREATE OR REPLACE PROCEDURE get_dm_log_list()
READS SQL DATA
BEGIN
    SELECT id,
        title,
        timestamp,
        location,
        lengthHours,
        serviceHours,
        description
    FROM dmLog;
END; //
DELIMITER ;