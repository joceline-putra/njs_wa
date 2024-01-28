DELIMITER $$
DROP TRIGGER IF EXISTS `tr_device_after_delete` $$
CREATE DEFINER = 'joe'@'localhost' TRIGGER `tr_device_after_delete` AFTER DELETE ON `devices` 
    FOR EACH ROW BEGIN
		IF OLD.device_group_id IS NOT NULL THEN
			SELECT COUNT(*) INTO @total FROM devices WHERE device_group_id=OLD.device_group_id;
			UPDATE devices_groups SET group_total_device=@total WHERE group_id=OLD.device_group_id;
		END IF;	
        DELETE FROM replies WHERE replies_device_number=OLD.device_number;
END$$
DELIMITER ;

DELIMITER $$
DROP TRIGGER IF EXISTS `tr_device_after_insert` $$
CREATE DEFINER = 'joe'@'localhost' TRIGGER `tr_device_after_insert` AFTER INSERT ON `devices` 
    FOR EACH ROW BEGIN
		IF NEW.device_group_id IS NOT NULL OR NEW.device_group_id != 0 THEN
			SELECT COUNT(*) INTO @total FROM devices WHERE device_group_id=NEW.device_group_id;
			UPDATE devices_groups SET group_total_device=@total WHERE group_id=NEW.device_group_id;
		END IF;	
END$$
DELIMITER ;

DELIMITER $$
DROP TRIGGER IF EXISTS `tr_device_after_udpate` $$
CREATE DEFINER = 'joe'@'localhost' TRIGGER `tr_device_after_udpate` AFTER UPDATE ON `devices` 
    FOR EACH ROW BEGIN
		IF NEW.device_group_id IS NOT NULL THEN
			SELECT COUNT(*) INTO @total FROM devices WHERE device_group_id=NEW.device_group_id;
			UPDATE devices_groups SET group_total_device=@total WHERE group_id=NEW.device_group_id;
		END IF;	
        UPDATE replies SET replies_device_number=NEW.device_number WHERE replies_device_number=OLD.device_number;
END$$
DELIMITER ;

DELIMITER $$
DROP TRIGGER IF EXISTS `tr_device_before_insert` $$
CREATE DEFINER = 'joe'@'localhost' TRIGGER `tr_device_before_insert` BEFORE INSERT ON `devices` 
    FOR EACH ROW BEGIN	
	SET NEW.device_date_created = NOW();
	SET NEW.device_date_updated = NOW();
	SET NEW.device_auth = fn_create_auth();
	SET NEW.device_date_expired = NOW() + INTERVAL 1 YEAR;
	
	INSERT INTO replies (`replies_device_number`,`replies_flag`,`replies_text_from`,`replies_text_return`,`replies_date_created`,`replies_text`) 
	VALUES(NEW.device_number,1,'ping','Device telah terhubung',NOW(),
	CONCAT('{"triggers":{"ping":"/server_connected"},"pages":{"/server_connected":{"content":"Device terhubung ke server"}}}'));
    
    END$$
DELIMITER ;

DELIMITER $$
DROP TRIGGER IF EXISTS `tr_device_before_update` $$
CREATE DEFINER = 'joe'@'localhost' TRIGGER `tr_device_before_update` BEFORE UPDATE ON `devices` 
    FOR EACH ROW BEGIN
    
		-- IF NEW.device_flag = 0 THEN
			-- SET NEW.device_ignore = 1;
		-- ELSE 
			-- SET NEW.device_ignore = 0;
		-- END IF;
		UPDATE replies SET replies_device_label=NEW.device_label WHERE replies_device_number=NEW.device_number;	
		SET NEW.device_date_updated = NOW();
    END$$
DELIMITER ;

DELIMITER $$
DROP TRIGGER IF EXISTS `tr_replies_before_insert` $$
CREATE DEFINER = 'joe'@'localhost' TRIGGER `tr_replies_before_insert` BEFORE INSERT ON `replies` 
    FOR EACH ROW BEGIN
		SET NEW.replies_date_created = NOW();
		SET NEW.replies_session =fn_create_session();
END$$
DELIMITER ;

DELIMITER $$
DROP TRIGGER IF EXISTS `tr_replies_before_update` $$
CREATE DEFINER = 'joe'@'localhost' TRIGGER `tr_replies_before_update` BEFORE UPDATE ON `replies` 
    FOR EACH ROW BEGIN
		SET NEW.replies_date_updated = NOW();
END$$
DELIMITER ;