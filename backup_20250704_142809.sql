-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: house_rental_db
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `house_info_view`
--

DROP TABLE IF EXISTS `house_info_view`;
/*!50001 DROP VIEW IF EXISTS `house_info_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `house_info_view` AS SELECT 
 1 AS `房号`,
 1 AS `房东姓名`,
 1 AS `状态`,
 1 AS `户型`,
 1 AS `地址`,
 1 AS `租金`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `house_types`
--

DROP TABLE IF EXISTS `house_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `house_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '户型名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '户型描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `house_types`
--

LOCK TABLES `house_types` WRITE;
/*!40000 ALTER TABLE `house_types` DISABLE KEYS */;
INSERT INTO `house_types` (`id`, `type_name`, `description`, `created_at`) VALUES (1,'一室一厅','适合单身人士或小夫妻居住哦','2025-07-03 10:49:46'),(2,'两室一厅','适合三口之家','2025-07-03 10:49:46'),(3,'三室两厅','适合大家庭','2025-07-03 10:49:46'),(4,'复式','上下两层的房屋','2025-07-03 10:49:46'),(5,'公寓','现代化公寓','2025-07-03 10:49:46'),(6,'四室一厅','很好','2025-07-03 05:12:08');
/*!40000 ALTER TABLE `house_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `houses`
--

DROP TABLE IF EXISTS `houses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `houses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `house_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房号',
  `address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房屋地址',
  `area` decimal(8,2) DEFAULT NULL COMMENT '面积(平方米)',
  `rent_price` decimal(10,2) NOT NULL COMMENT '租金',
  `deposit` decimal(10,2) DEFAULT NULL COMMENT '押金',
  `status` enum('available','rented') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '房屋描述',
  `type_id` int NOT NULL COMMENT '户型ID',
  `landlord_id` int NOT NULL COMMENT '房东ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `house_number` (`house_number`),
  KEY `idx_houses_status` (`status`),
  KEY `idx_houses_landlord` (`landlord_id`),
  KEY `idx_houses_type` (`type_id`),
  CONSTRAINT `houses_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `house_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `houses_ibfk_2` FOREIGN KEY (`landlord_id`) REFERENCES `landlords` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `houses`
--

LOCK TABLES `houses` WRITE;
/*!40000 ALTER TABLE `houses` DISABLE KEYS */;
INSERT INTO `houses` (`id`, `house_number`, `address`, `area`, `rent_price`, `deposit`, `status`, `description`, `type_id`, `landlord_id`, `created_at`) VALUES (1,'A001','朝阳区建国门大街1号院1单元101',45.50,3500.00,500.00,'available','精装修，采光好，交通便利',6,1,'2025-07-03 10:49:46'),(2,'A002','朝阳区建国门大街1号院1单元102',48.00,3800.00,3800.00,'rented','装修新，家具齐全',1,1,'2025-07-03 10:49:46'),(3,'B001','海淀区中关村大街2号院2单元201',75.00,4500.00,4500.00,'available','学区房，周边配套完善',2,2,'2025-07-03 10:49:46'),(4,'B002','海淀区中关村大街2号院2单元202',80.00,4800.00,4800.00,'available','南北通透，视野开阔',2,2,'2025-07-03 10:49:46'),(5,'C001','西城区金融街3号院3单元301',110.00,6500.00,6500.00,'available','豪华装修，高端小区',3,3,'2025-07-03 10:49:46'),(6,'C002','西城区金融街3号院3单元302',120.00,7000.00,7000.00,'available','正在装修中',3,3,'2025-07-03 10:49:46'),(7,'D001','朝阳区望京西路4号院复式A',150.00,8500.00,8500.00,'available','复式结构，环境优美',4,1,'2025-07-03 10:49:46'),(8,'E001','东城区王府井大街5号公寓A座101',60.00,4200.00,100.00,'available','现代公寓，设施齐全',5,4,'2025-07-03 10:49:46'),(9,'E002','丰台区方庄路6号公寓B座201',55.00,3900.00,3900.00,'available','交通便利，性价比高',5,5,'2025-07-03 10:49:46'),(10,'B007','沙河市',200.00,6000.00,5000.00,'available','',5,1,'2025-07-03 21:06:09');
/*!40000 ALTER TABLE `houses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `landlords`
--

DROP TABLE IF EXISTS `landlords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `landlords` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房东姓名',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '联系电话',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `id_card` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '身份证号',
  `address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '地址',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_card` (`id_card`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `landlords`
--

LOCK TABLES `landlords` WRITE;
/*!40000 ALTER TABLE `landlords` DISABLE KEYS */;
INSERT INTO `landlords` (`id`, `name`, `phone`, `email`, `id_card`, `address`, `created_at`) VALUES (1,'张三','13800138001','zhangsan@email.com','110101199001011234','北京市朝阳区建国门大街100号','2025-07-03 10:49:46'),(2,'李四','13800138002','lisi@email.com','110101199002021234','北京市海淀区中关村大街200号','2025-07-03 10:49:46'),(3,'王五','13800138003','wangwu@email.com','110101199003031234','北京市西城区金融街300号','2025-07-03 10:49:46'),(4,'赵六','13800138004','zhaoliu@email.com','110101199004041234','北京市东城区王府井大街400号','2025-07-03 10:49:46'),(5,'钱七','13800138005','qianqi@email.com','110101199005051234','北京市丰台区方庄路500号','2025-07-03 10:49:46');
/*!40000 ALTER TABLE `landlords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_date` date NOT NULL COMMENT '缴费日期',
  `amount` decimal(10,2) NOT NULL COMMENT '金额',
  `payment_type` enum('rent','deposit','utilities','penalty') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '缴费类型',
  `payment_method` enum('cash','transfer','alipay','wechat') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'cash' COMMENT '支付方式',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '备注',
  `rental_id` int NOT NULL COMMENT '租房记录ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `payment_status` enum('pending','paid','returned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `paid_at` datetime DEFAULT NULL,
  `contract_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '合同号',
  PRIMARY KEY (`id`),
  KEY `idx_payments_rental` (`rental_id`),
  KEY `idx_payments_date` (`payment_date`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` (`id`, `payment_date`, `amount`, `payment_type`, `payment_method`, `description`, `rental_id`, `created_at`, `payment_status`, `paid_at`, `contract_number`) VALUES (45,'2025-07-04',3800.00,'deposit','transfer','押金退还',23,'2025-07-03 19:39:50','returned','2025-07-04 03:40:08','HT20250704113942'),(46,'2025-07-04',11400.00,'rent','transfer','租金(租期3个月)',23,'2025-07-03 19:39:51','paid','2025-07-04 03:59:19','HT20250704113942'),(47,'2025-07-04',4800.00,'deposit','transfer','押金退还',24,'2025-07-03 19:58:59','returned','2025-07-04 03:59:27','HT20250704115850'),(48,'2025-07-04',14400.00,'rent','transfer','租金(租期3个月)',24,'2025-07-03 19:58:59','paid','2025-07-04 03:59:29','HT20250704115850'),(49,'2025-07-25',11.00,'utilities','cash','',24,'2025-07-03 20:55:06','paid','2025-07-04 04:55:13',NULL),(50,'2025-07-04',4500.00,'deposit','transfer','押金退还',25,'2025-07-03 22:26:31','returned','2025-07-04 06:26:47','HT20250704142622'),(51,'2025-07-04',4500.00,'rent','transfer','租金(租期1个月)',25,'2025-07-03 22:26:32','paid','2025-07-04 06:26:55','HT20250704142622'),(52,'2025-07-04',3800.00,'deposit','transfer','押金',26,'2025-07-03 22:27:28','paid','2025-07-04 06:27:34','HT20250704142718'),(53,'2025-07-04',15200.00,'rent','transfer','租金(租期4个月)',26,'2025-07-03 22:27:28','paid','2025-07-04 06:27:38','HT20250704142718');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rentals`
--

DROP TABLE IF EXISTS `rentals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rentals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `start_date` date NOT NULL COMMENT '开始日期',
  `end_date` date NOT NULL COMMENT '结束日期',
  `monthly_rent` decimal(10,2) NOT NULL COMMENT '月租金',
  `deposit_paid` decimal(10,2) NOT NULL COMMENT '已付押金',
  `status` enum('active','expired','terminated') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT '状态',
  `contract_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '合同编号',
  `house_id` int NOT NULL COMMENT '房屋ID',
  `tenant_id` int NOT NULL COMMENT '租客ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `returned_at` timestamp NULL DEFAULT NULL COMMENT '归还时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `contract_number` (`contract_number`),
  KEY `idx_rentals_house` (`house_id`),
  KEY `idx_rentals_tenant` (`tenant_id`),
  KEY `idx_rentals_status` (`status`),
  CONSTRAINT `rentals_ibfk_1` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rentals_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rentals`
--

LOCK TABLES `rentals` WRITE;
/*!40000 ALTER TABLE `rentals` DISABLE KEYS */;
INSERT INTO `rentals` (`id`, `start_date`, `end_date`, `monthly_rent`, `deposit_paid`, `status`, `contract_number`, `house_id`, `tenant_id`, `created_at`, `returned_at`) VALUES (23,'2025-07-10','2025-10-08',3800.00,3800.00,'terminated','HT20250704113942',2,3,'2025-07-03 19:39:50','2025-07-03 20:00:10'),(24,'2025-07-04','2025-10-02',4800.00,4800.00,'terminated','HT20250704115850',4,2,'2025-07-03 19:58:59','2025-07-03 21:00:38'),(25,'2025-07-25','2025-08-24',4500.00,4500.00,'terminated','HT20250704142622',3,4,'2025-07-03 22:26:31','2025-07-03 22:27:01'),(26,'2025-08-01','2025-11-29',3800.00,3800.00,'active','HT20250704142718',2,2,'2025-07-03 22:27:27',NULL);
/*!40000 ALTER TABLE `rentals` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_house_status_on_rental` AFTER INSERT ON `rentals` FOR EACH ROW BEGIN
    UPDATE houses 
    SET status = 'rented' 
    WHERE id = NEW.house_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_house_status_on_return` AFTER UPDATE ON `rentals` FOR EACH ROW BEGIN
    IF NEW.status = 'terminated' AND OLD.status != 'terminated' THEN
        UPDATE houses 
        SET status = 'available' 
        WHERE id = NEW.house_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '租客姓名',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '联系电话',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `id_card` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '身份证号',
  `address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '地址',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_card` (`id_card`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` (`id`, `name`, `phone`, `email`, `id_card`, `address`, `created_at`) VALUES (1,'刘小明','13900139001','liuxiaoming@email.com','110101199004041235','北京市朝阳区三里屯','2025-07-03 10:49:46'),(2,'陈小红','13900139002','chenxiaohong@email.com','110101199005051236','北京市海淀区五道口','2025-07-03 10:49:46'),(3,'孙小强','13900139003','sunxiaoqiang@email.com','110101199006061237','北京市西城区西单','2025-07-03 10:49:46'),(4,'周小美','13900139004','zhouxiaomei@email.com','110101199007071238','北京市东城区王府井','2025-07-03 10:49:46'),(5,'吴小刚','13900139005','wuxiaogang@email.com','110101199008081239','北京市丰台区角门','2025-07-03 10:49:46');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','manager','user') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `phone`, `role`, `is_active`, `created_at`, `last_login`) VALUES (1,'admin','admin@example.com','scrypt:32768:8:1$vf0ASA0MH3kcGlta$422a8002cc2dc0785adc60771aaa641c4759789ac6e743234a9ca760e223d2071d4f799e083fdd5a9e1b35eadc731fda7bfcfe9dc68594cdba7e37cee9e200a4','系统管理员',NULL,'admin',1,'2025-07-03 11:24:13','2025-07-04 06:10:51'),(2,'aaaaa','w1853522115@outlook.com','scrypt:32768:8:1$A8YslgT91zCeunOF$1e03292aa7ad9ac910b907842f9a372b59b104745c164650a3b1811646f3942636feb94d0ceebc9d03407a17765a3a26f02b89c0e22d51b2b27e879bd252b9f3','zhy','15656376440','user',1,'2025-07-04 04:53:36','2025-07-04 04:53:47');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'house_rental_db'
--
/*!50003 DROP PROCEDURE IF EXISTS `GetHouseTypeRentalStats` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetHouseTypeRentalStats`()
BEGIN
    SELECT 
        ht.type_name AS '户型',
        COUNT(h.id) AS '总房屋数',
        COUNT(CASE WHEN h.status = 'rented' THEN 1 END) AS '已出租数量',
        COUNT(CASE WHEN h.status = 'available' THEN 1 END) AS '可出租数量'
    FROM house_types ht
    LEFT JOIN houses h ON ht.id = h.type_id
    GROUP BY ht.id, ht.type_name
    ORDER BY ht.type_name;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `house_info_view`
--

/*!50001 DROP VIEW IF EXISTS `house_info_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `house_info_view` AS select `h`.`house_number` AS `房号`,`l`.`name` AS `房东姓名`,`h`.`status` AS `状态`,`ht`.`type_name` AS `户型`,`h`.`address` AS `地址`,`h`.`rent_price` AS `租金` from ((`houses` `h` join `landlords` `l` on((`h`.`landlord_id` = `l`.`id`))) join `house_types` `ht` on((`h`.`type_id` = `ht`.`id`))) order by `h`.`house_number` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-04 14:28:10
-- MySQL数据库备份文件
-- 数据库: house_rental_db
-- 备份时间: 2025-07-04 14:28:09
-- 生成工具: 房屋租赁管理系统
-- ------------------------------------------------------

