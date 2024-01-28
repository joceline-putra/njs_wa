DELIMITER $$
DROP FUNCTION IF EXISTS `fn_create_auth` $$
CREATE DEFINER=`joe`@`localhost` FUNCTION `fn_create_auth`() RETURNS VARCHAR(128) CHARSET latin1 DETERMINISTIC
BEGIN
	SET @chars = 'deRSABCDJK2EF3GHpquQrstP4vwxy5LMhiN6mnT7WXabcf9YZg7jUVkz8';
	SET @charLen = LENGTH(@chars);
	SET @random = '';
	WHILE LENGTH(@random) < 30
		DO
		SET @random = CONCAT(@random, SUBSTRING(@chars,CEILING(RAND() * @charLen),1));
	END WHILE;
	RETURN @random ;
    END$$
DELIMITER ;

DELIMITER $$
DROP FUNCTION IF EXISTS `fn_create_session` $$
CREATE DEFINER=`joe`@`localhost` FUNCTION `fn_create_session`() RETURNS VARCHAR(128) CHARSET latin1 DETERMINISTIC
BEGIN
    SET @chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    SET @charLen = LENGTH(@chars);
    SET @random = '';
    WHILE LENGTH(@random) < 20
            DO
            SET @random = CONCAT(@random, SUBSTRING(@chars,CEILING(RAND() * @charLen),1));
    END WHILE;
    RETURN @random ;
    END$$
DELIMITER ;

DELIMITER $$
DROP FUNCTION IF EXISTS `fn_random_trx` $$
CREATE DEFINER=`joe`@`localhost` FUNCTION `fn_random_trx`() RETURNS VARCHAR(128) CHARSET latin1 DETERMINISTIC
BEGIN
        SET @chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        SET @charLen = LENGTH(@chars);
        SET @random = '';
        WHILE LENGTH(@random) < 20
                DO
                SET @random = CONCAT(@random, SUBSTRING(@chars,CEILING(RAND() * @charLen),1));
        END WHILE;
        RETURN @random;
    END$$
DELIMITER ;

DELIMITER $$
DROP FUNCTION IF EXISTS `fn_time_ago` $$
CREATE DEFINER=`joe`@`localhost` FUNCTION `fn_time_ago`(vDATE VARCHAR(255)) RETURNS VARCHAR(255) CHARSET latin1 DETERMINISTIC
BEGIN
    DECLARE mDATE1 VARCHAR(255) DEFAULT "";
    DECLARE mDATE2 VARCHAR(255) DEFAULT "";			
    
    SELECT UNIX_TIMESTAMP(), UNIX_TIMESTAMP(vDATE) INTO mDATE1, mDATE2;
    SET @second = mDATE1 - mDATE2; 
    SET @minute = ROUND(@second/60);
    SET @hour = ROUND(@second/3600);
    SET @day = ROUND(@second/86400);
    SET @week = ROUND(@second/604800);
    SET @month = ROUND(@second/2419200);
    SET @year = ROUND(@second/29030400);
    
    IF @second <= 60 THEN
        SET @time_ago := CONCAT(@second,' detik yang lalu');
    ELSEIF @minute <= 60 THEN
        SET @time_ago := CONCAT(@minute,' menit yang lalu');
    ELSEIF @hour <= 24 THEN
        SET @time_ago := CONCAT(@hour,' jam yang lalu');			
    ELSEIF @day <= 7 THEN
        SET @time_ago := CONCAT(@day,' hari yang lalu');			
    ELSEIF @week <= 4 THEN	
        SET @time_ago := CONCAT(@week,' minggu yang lalu');			
    ELSEIF @month <= 12 THEN								
        SET @time_ago := CONCAT(@month,' bulan yang lalu');						
    ELSE
        SET @time_ago := CONCAT(@year,' tahun yang lalu');			
    END IF;
    SET @result := @time_ago;
    RETURN @result;
    END$$
DELIMITER ;