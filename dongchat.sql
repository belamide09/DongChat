-- phpMyAdmin SQL Dump
-- version 4.4.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Nov 28, 2015 at 10:33 AM
-- Server version: 5.6.26
-- PHP Version: 5.6.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dongchat`
--

-- --------------------------------------------------------

--
-- Table structure for table `chat_histories`
--

CREATE TABLE IF NOT EXISTS `chat_histories` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `started` datetime NOT NULL,
  `end` datetime NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `chat_histories`
--

INSERT INTO `chat_histories` (`id`, `sender_id`, `recipient_id`, `started`, `end`) VALUES
(1, 2, 1, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(2, 2, 1, '2015-11-28 09:32:57', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `onair_users`
--

CREATE TABLE IF NOT EXISTS `onair_users` (
  `id` int(11) NOT NULL,
  `peer` varchar(300) NOT NULL,
  `created_datetime` datetime NOT NULL,
  `created_ip` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `onair_users`
--

INSERT INTO `onair_users` (`id`, `peer`, `created_datetime`, `created_ip`) VALUES
(1, 'ymw00qv6vdbzkt90', '2015-11-28 08:46:26', '::1'),
(2, '3oyvj05qr70q9f6r', '2015-11-28 08:50:35', '::1');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(300) NOT NULL,
  `members` int(11) NOT NULL,
  `host` int(11) NOT NULL,
  `created_datetime` datetime NOT NULL,
  `created_ip` varchar(300) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `room_members`
--

CREATE TABLE IF NOT EXISTS `room_members` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_datetime` datetime NOT NULL,
  `created_ip` varchar(300) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL,
  `email` varchar(300) NOT NULL,
  `password` varchar(300) NOT NULL,
  `status` int(11) NOT NULL,
  `firstname` varchar(300) NOT NULL,
  `middlename` varchar(300) NOT NULL,
  `lastname` varchar(300) NOT NULL,
  `photo` varchar(300) NOT NULL,
  `gender` int(11) NOT NULL,
  `country` varchar(300) NOT NULL,
  `created_datetime` datetime NOT NULL,
  `created_ip` varchar(300) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `status`, `firstname`, `middlename`, `lastname`, `photo`, `gender`, `country`, `created_datetime`, `created_ip`) VALUES
(1, 'belamide09@gmail.com', 'ee7f4bd72984a72ec1eb92f3d9c6f065e00d7e14', 1, 'John Mart', 'Bayadog', 'Belamide', 'user1.jpg', 1, 'Philippines', '2015-11-27 13:14:00', ''),
(2, 'jacob@gmail.com', 'ee7f4bd72984a72ec1eb92f3d9c6f065e00d7e14', 1, 'Jacob', '', 'Potolin', 'user2.jpg', 1, 'Philippines', '2015-11-27 13:14:00', ''),
(3, 'lester@gmail.com', 'ee7f4bd72984a72ec1eb92f3d9c6f065e00d7e14', 1, 'Lester', '', 'The great', 'user3.jpg', 1, 'Philippines', '2015-11-27 13:14:00', ''),
(4, 'burt@gmail.com', 'ee7f4bd72984a72ec1eb92f3d9c6f065e00d7e14', 1, 'Burt', '', 'Cabigas', 'user4.jpg', 1, 'Philippines', '2015-11-27 13:14:00', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chat_histories`
--
ALTER TABLE `chat_histories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `onair_users`
--
ALTER TABLE `onair_users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `room_members`
--
ALTER TABLE `room_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chat_histories`
--
ALTER TABLE `chat_histories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `room_members`
--
ALTER TABLE `room_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=10;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
