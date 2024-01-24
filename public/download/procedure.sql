DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_chat_return`$$
CREATE PROCEDURE `sp_chat_return`(
  IN vNUMBER VARCHAR(255),
  IN vTEXT VARCHAR(255)
)
BEGIN
    SELECT c2.* 
    FROM chats AS c1 
    LEFT JOIN chats AS c2 ON c1.chat_parent_id=c2.chat_id
    WHERE c1.chat_device_number=vNUMBER AND c1.chat_text=vTEXT;
END $$
DELIMITER ;