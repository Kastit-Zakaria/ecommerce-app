package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {

    // existsByEmail : requête déduite du nom par Spring Data (nom imposé, ne pas renommer)
    // Reçoit : strEmail, l'adresse e-mail à chercher
    // Renvoie : true si cette adresse est déjà inscrite
    // Pourquoi : refuser les inscriptions en double
    boolean existsByEmail(String strEmail);
}
