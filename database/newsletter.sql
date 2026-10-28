-- Table des inscrits à la newsletter (RGPD : e-mail + date du consentement)
-- À exécuter dans phpMyAdmin, sur la base `ecommercedb` (onglet SQL).
-- Ce script ne touche à aucune table existante.

CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `consent_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_newsletter_subscribers_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
