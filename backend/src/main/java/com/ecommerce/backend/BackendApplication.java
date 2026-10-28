package com.ecommerce.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    // main : point d'entrée de l'application (le nom est imposé par Java)
    // Reçoit : tbArgs, les arguments de la ligne de commande
    // Renvoie : rien
    // Pourquoi : démarrer le serveur Spring Boot
    public static void main(String[] tbArgs) {
        SpringApplication.run(BackendApplication.class, tbArgs);
    }

}
