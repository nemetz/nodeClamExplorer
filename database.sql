-- MySQL dump 10.17  Distrib 10.3.15-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 212.47.251.139    Database: clam
-- ------------------------------------------------------
-- Server version	10.1.38-MariaDB-0+deb9u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blocos`
--

DROP TABLE IF EXISTS `blocos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blocos` (
  `id` int(11) NOT NULL,
  `hash` varchar(64) NOT NULL,
  `timestamp` int(10) NOT NULL,
  `tamanho` int(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `index` (`id`),
  KEY `hash` (`hash`),
  KEY `index tamanho` (`tamanho`),
  KEY `index time` (`timestamp`),
  FULLTEXT KEY `hash match` (`hash`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `config` (
  `config` varchar(200) NOT NULL,
  `valor` varchar(200) NOT NULL,
  UNIQUE KEY `config_UNIQUE` (`config`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transacoes`
--

DROP TABLE IF EXISTS `transacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transacoes` (
  `id` varchar(64) CHARACTER SET latin1 NOT NULL,
  `bloco` int(20) NOT NULL,
  `speech` text,
  `coletado` tinyint(1) NOT NULL DEFAULT '0',
  `coinbase` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `bloco` (`bloco`),
  KEY `tx` (`id`),
  KEY `coletado` (`coletado`),
  KEY `id` (`id`),
  KEY `indexCoinbase` (`coinbase`),
  FULLTEXT KEY `match` (`speech`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `utxo`
--

DROP TABLE IF EXISTS `utxo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `utxo` (
  `id` varchar(255) NOT NULL,
  `endereco` varchar(45) NOT NULL,
  `quantidade` double NOT NULL,
  `tipo` varchar(3) NOT NULL,
  UNIQUE KEY `unico` (`id`,`endereco`),
  KEY `endereco` (`endereco`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'clam'
--
