DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_broadcast_prepare` $$
CREATE DEFINER=`joe`@`localhost` PROCEDURE `sp_broadcast_prepare`(IN mGROUP VARCHAR(255))
BEGIN
	SET max_sp_recursion_depth=255;
	BLOCK_A:BEGIN
		DECLARE mTRACK VARCHAR(255);
		DECLARE mTEXT TEXT;
		DECLARE mDEVICE_GROUP INT(255);

		/* Prepare */
		SELECT prepare_message_track_session, prepare_message_group_session, prepare_device_group_id, prepare_text
		INTO mTRACK, mGROUP, mDEVICE_GROUP, mTEXT
		FROM messages_prepares 
		WHERE prepare_message_group_session=mGROUP LIMIT 1;
		
		/* Contacts into messages */
		INSERT INTO `whatsapp`.`messages` (
		  `message_session`,`message_flag`,`message_text`,
		  `message_contact_id`,
		  `message_contact_number`,
		  `message_date_created`,`message_type`,`message_track_session`,`message_group_session`
		) SELECT CONCAT(fn_create_session()), CONCAT(0), CONCAT(REPLACE(IFNULL(mTEXT,''),'#nama#',IFNULL(contact_name,''))), 
		contact_id, contact_phone_1, NOW(), CONCAT(1), CONCAT(mTRACK), CONCAT(mGROUP)
		FROM contacts
		WHERE contact_group_session=mTRACK;
		
		/* Set Message Device ID From Device available id for broadcast */
		UPDATE messages AS m
		SET m.message_device_id=(SELECT device_id FROM devices WHERE device_group_id=mDEVICE_GROUP AND device_flag=1 ORDER BY RAND() LIMIT 1)
		WHERE m.message_group_session=mGROUP;
	END BLOCK_A;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_contact_check_register` $$
CREATE DEFINER=`joe`@`localhost` PROCEDURE `sp_contact_check_register`()
BEGIN
    SELECT contact_id, contact_name, contact_phone_1 AS contact_number, contact_flag, contact_registered_whatsapp
    FROM contacts
    WHERE contact_registered_whatsapp=0 AND contact_flag < 4;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_contact_update_is_register` $$
CREATE DEFINER=`joe`@`localhost` PROCEDURE `sp_contact_update_is_register`(IN vCONTACT_ID BIGINT(255))
BEGIN
    UPDATE contacts SET contact_flag=1, contact_registered_whatsapp=1 WHERE contact_id=vCONTACT_ID;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_contact_update_not_register` $$
CREATE DEFINER=`joe`@`localhost` PROCEDURE `sp_contact_update_not_register`(IN vCONTACT_ID BIGINT(255))
BEGIN
    UPDATE contacts SET contact_flag=4, contact_registered_whatsapp=0 WHERE contact_id=vCONTACT_ID;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_device_active` $$
CREATE DEFINER=`joe`@`localhost` PROCEDURE `sp_device_active`()
BEGIN
    SELECT device_label, device_number,
    CASE WHEN device_flag=1 THEN 'Connected' ELSE '-' END AS device_is_active,
    CASE WHEN device_ignore=1 THEN 'Device Ignored' ELSE '-' END AS device_is_ignore,
    fn_time_ago(device_date_updated) AS device_last_update, replies_text, device_auth
    FROM devices
    LEFT JOIN replies ON device_number = replies_device_number
    ORDER BY device_date_updated DESC, device_label ASC;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_device_replies` $$
CREATE DEFINER=`joe`@`localhost` PROCEDURE `sp_device_replies`()
BEGIN
    SELECT device_label, device_number, replies_text, device_flag, device_ignore, replies_flag
    FROM devices LEFT JOIN replies ON device_number=replies_device_number WHERE device_ignore=0;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_message_create_prepare_blast` $$
CREATE DEFINER=`joe`@`localhost` PROCEDURE `sp_message_create_prepare_blast`()
BEGIN
	-- DECLARE mCONTACT_COUNT INTEGER;
	-- DECLARE mDEVICE_ID INTEGER;
	-- DECLARE mDEVICE_NUMBER VARCHAR(255);
	DECLARE mCONTACT_NUMBER VARCHAR(255);
	DECLARE mTEXT TEXT;
	DECLARE mFINISHED INTEGER;
	DECLARE mFOUND_ROW INTEGER;
	DECLARE mACTION_CURSOR CURSOR FOR 
		SELECT contact_phone_1, (SELECT message_text FROM messages WHERE message_id=6) 
		FROM contacts ORDER BY contact_id ASC;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET mFINISHED = 1;	
	
	OPEN mACTION_CURSOR;
	LOOP_1: LOOP
		FETCH mACTION_CURSOR INTO mCONTACT_NUMBER, mTEXT;
		IF mFINISHED = 1 THEN LEAVE LOOP_1; END IF;
		INSERT INTO `messages` (`message_device_id`,`message_session`,`message_group_session`,`message_flag`,`message_text`,`message_contact_number`,
		`message_date_created`) 
		VALUES(13,fn_create_session(),211007,0,mTEXT,mCONTACT_NUMBER,NOW());
	END LOOP LOOP_1;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_message_move_group_session` $$
CREATE DEFINER=`joe`@`localhost` PROCEDURE `sp_message_move_group_session`(IN vGROUP_SESSION VARCHAR(255),IN vDEVICE_NUMBER VARCHAR(255))
BEGIN
	DECLARE mTOTAL INT(50) DEFAULT 0;
	DECLARE mDEVICE_ID BIGINT(255);
	SELECT COUNT(*) INTO mTOTAL FROM devices WHERE device_number=vDEVICE_NUMBER;
	IF mTOTAL > 0 THEN
		SELECT device_id INTO mDEVICE_ID FROM devices WHERE device_number=vDEVICE_NUMBER;
		UPDATE messages SET message_device_id=mDEVICE_ID WHERE message_group_session=vGROUP_SESSION;
		SELECT COUNT(*) INTO mTOTAL FROM messages WHERE message_group_session=vGROUP_SESSION;
		SELECT 1 AS `status`, CONCAT(mTOTAL,' Messages changed on session ',vGROUP_SESSION) AS `message`;
	ELSE
		SELECT 0 AS `status`, CONCAT('Device not found') AS `message`;
	END IF;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_message_send_group_session` $$
CREATE DEFINER=`joe`@`localhost` PROCEDURE `sp_message_send_group_session`(IN vGROUP_SESSION VARCHAR(255))
BEGIN
	SELECT message_id, device_number, device_auth, message_group_session, message_session, message_text, message_url, message_contact_name, message_contact_number,
	message_flag, message_date_sent
	FROM messages
	LEFT JOIN devices ON message_device_id=device_id
	WHERE message_group_session=vGROUP_SESSION AND message_flag=0;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_message_update_not_sent` $$
CREATE DEFINER=`joe`@`localhost` PROCEDURE `sp_message_update_not_sent`(IN vMESSAGE_ID BIGINT(255))
BEGIN
	UPDATE messages SET message_flag=4 WHERE message_id=vMESSAGE_ID;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_message_update_sent` $$
CREATE DEFINER=`joe`@`localhost` PROCEDURE `sp_message_update_sent`(IN vMESSAGE_ID BIGINT(255))
BEGIN
	UPDATE messages SET message_date_sent=NOW(), message_flag=1 WHERE message_id=vMESSAGE_ID;
END$$
DELIMITER ;