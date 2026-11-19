-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 19 nov. 2026 à 20:19
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ecommercedb`
--

-- --------------------------------------------------------

--
-- Structure de la table `brands`
--

CREATE TABLE `brands` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `brands`
--

INSERT INTO `brands` (`id`, `name`) VALUES
(1, 'Marque A'),
(2, 'Marque B'),
(3, 'Marque C'),
(4, 'Marque D');

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `image_url`) VALUES
(1, 'Hommes', NULL, '/images/men1.webp'),
(2, 'Femmes', NULL, '/images/women1.jpeg'),
(3, 'Enfants', NULL, '/images/kid1.jpg'),
(4, 'Accessoires', NULL, '/images/accessoire1.webp'),
(5, 'Nouveautés', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `newsletter_subscribers`
--

CREATE TABLE `newsletter_subscribers` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `consent_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address` text NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `quantity` int(11) NOT NULL CHECK (`quantity` > 0),
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `stripe_id` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0 CHECK (`stock` >= 0),
  `image_url` varchar(255) DEFAULT NULL,
  `category_id` bigint(20) DEFAULT NULL,
  `brand_id` bigint(20) NOT NULL,
  `type_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `image_url`, `category_id`, `brand_id`, `type_id`) VALUES
(1, 'Chemise en lin', 'Chemise à manches longues en 100 % lin lavé, légère et respirante. Col classique, boutonnage nacré et coupe droite décontractée. Idéale pour les journées chaudes.', 49.90, 10, '/images/men1.webp', 1, 1, 1),
(2, 'Veste chino', 'Veste en sergé de coton stretch (98 % coton, 2 % élasthanne). Coupe ajustée, deux poches plaquées et fermeture à boutons. Se porte aussi bien au bureau qu\'en week-end.', 89.00, 5, '/images/men2.webp', 1, 2, 3),
(3, 'Pantalon cargo', 'Pantalon cargo en toile de coton épaisse. Taille élastiquée avec cordon, poches latérales à rabat et chevilles resserrées. Robuste et confortable au quotidien.', 69.00, 8, '/images/men3.jpeg', 1, 4, 2),
(4, 'Robe d\'été', 'Robe mi-longue en viscose fluide à imprimé floral. Encolure en V, manches courtes volantées et ceinture à nouer à la taille. Doublure légère en coton.', 64.90, 12, '/images/women1.jpeg', 2, 3, 6),
(5, 'Blazer ajusté', 'Blazer cintré en tissu mélangé polyester et viscose, doublé en satin. Revers crantés, fermeture un bouton et poches à rabat. Une pièce structurée pour une silhouette élégante.', 119.00, 4, '/images/women2.jpeg', 2, 2, 3),
(6, 'Jean droit', 'Jean taille haute à jambe droite en denim de coton rigide (100 % coton). Délavage moyen, cinq poches et fermeture à braguette boutonnée. Un basique intemporel.', 79.00, 9, '/images/women3.jpeg', 2, 4, 2),
(7, 'Top en maille', 'Top en maille côtelée fine (coton et modal), doux et extensible. Col rond, manches courtes et coupe près du corps. Parfait seul ou sous une veste.', 34.90, 15, '/images/women4.webp', 2, 3, 7),
(8, 'Sweat à capuche', 'Sweat à capuche en molleton gratté à l\'intérieur (80 % coton, 20 % polyester). Poche kangourou, poignets et bas côtelés. Chaud et résistant pour les journées actives.', 29.90, 20, '/images/kid1.jpg', 3, 4, 4),
(9, 'Salopette', 'Salopette en denim de coton souple. Bretelles réglables à boucles métalliques, poche plastron et boutons pression sur les côtés pour un enfilage facile.', 39.00, 7, '/images/kid2.jpg', 3, 1, 2),
(10, 'T-shirt rayé', 'T-shirt à rayures marinières en jersey de coton bio. Col rond renforcé et manches courtes. Doux pour la peau et facile d\'entretien, lavable en machine à 30 °C.', 14.90, 25, '/images/kid3.jpg', 3, 3, 7),
(11, 'Sac cabas', 'Grand sac cabas en toile de coton épaisse avec anses en cuir synthétique. Fermeture aimantée, poche intérieure zippée. Assez spacieux pour un ordinateur portable.', 45.00, 6, '/images/accessoire1.webp', 4, 2, 9),
(12, 'Casquette', 'Casquette six pans en sergé de coton délavé. Visière incurvée, œillets d\'aération brodés et sangle réglable à l\'arrière. Taille unique.', 19.90, 18, '/images/accessoire2.webp', 4, 4, 10),
(13, 'Écharpe en laine', 'Écharpe longue en laine mérinos mélangée (70 % laine, 30 % acrylique), finitions à franges. Chaude, douce et légère, elle ne gratte pas.', 32.00, 11, '/images/accessoire3.webp', 4, 1, 11);

-- --------------------------------------------------------

--
-- Structure de la table `product_sizes`
--

CREATE TABLE `product_sizes` (
  `product_id` bigint(20) NOT NULL,
  `size_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `product_sizes`
--

INSERT INTO `product_sizes` (`product_id`, `size_id`) VALUES
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(3, 2),
(3, 3),
(3, 4),
(3, 5),
(4, 1),
(4, 2),
(4, 3),
(4, 4),
(5, 1),
(5, 2),
(5, 3),
(5, 4),
(6, 1),
(6, 2),
(6, 3),
(6, 4),
(7, 1),
(7, 2),
(7, 3),
(7, 4),
(8, 6),
(8, 7),
(8, 8),
(8, 9),
(9, 6),
(9, 7),
(9, 8),
(9, 9),
(10, 6),
(10, 7),
(10, 8),
(10, 9),
(11, 10),
(12, 10),
(13, 10);

-- --------------------------------------------------------

--
-- Structure de la table `product_types`
--

CREATE TABLE `product_types` (
  `id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `product_types`
--

INSERT INTO `product_types` (`id`, `name`) VALUES
(10, 'Chapeaux'),
(5, 'Chaussures'),
(1, 'Chemises'),
(11, 'Écharpes'),
(7, 'Hauts'),
(8, 'Jupes'),
(2, 'Pantalons'),
(4, 'Pulls'),
(6, 'Robes'),
(9, 'Sacs'),
(3, 'Vestes');

-- --------------------------------------------------------

--
-- Structure de la table `sizes`
--

CREATE TABLE `sizes` (
  `id` bigint(20) NOT NULL,
  `label` varchar(20) NOT NULL,
  `sort_order` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `sizes`
--

INSERT INTO `sizes` (`id`, `label`, `sort_order`) VALUES
(1, 'XS', 1),
(2, 'S', 2),
(3, 'M', 3),
(4, 'L', 4),
(5, 'XL', 5),
(6, '4 ans', 10),
(7, '6 ans', 11),
(8, '8 ans', 12),
(9, '10 ans', 13),
(10, 'Taille unique', 20);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `city` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'ROLE_USER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `address`, `postal_code`, `city`, `email`, `password_hash`, `role`) VALUES
(1, 'Camille', 'Dupont', 'Rue de l\'Exemple 12', '1000', 'Bruxelles', 'compte.test@exemple.com', '$2a$10$/8tPQ/hEQtkiqI2CtL8tcupn8Mk4ap2ID4UIDr7gbfAPKNWZmzHRe', 'ROLE_USER');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_newsletter_subscribers_email` (`email`);

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_order_product` (`order_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Index pour la table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Index pour la table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `fk_products_brand` (`brand_id`),
  ADD KEY `fk_products_type` (`type_id`);

--
-- Index pour la table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD PRIMARY KEY (`product_id`,`size_id`),
  ADD KEY `fk_ps_size` (`size_id`);

--
-- Index pour la table `product_types`
--
ALTER TABLE `product_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `label` (`label`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `product_types`
--
ALTER TABLE `product_types`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Contraintes pour la table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  ADD CONSTRAINT `fk_products_type` FOREIGN KEY (`type_id`) REFERENCES `product_types` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD CONSTRAINT `fk_ps_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ps_size` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
