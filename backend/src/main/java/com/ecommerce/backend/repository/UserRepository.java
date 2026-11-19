package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // findByEmail : requête déduite du nom par Spring Data (nom imposé, ne pas renommer)
    // Reçoit : strEmail, l'adresse e-mail (login) à chercher
    // Renvoie : le membre correspondant, ou un Optional vide
    // Pourquoi : retrouver le membre qui tente de se connecter
    Optional<User> findByEmail(String strEmail);
}
