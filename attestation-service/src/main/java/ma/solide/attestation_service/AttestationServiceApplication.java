package ma.solide.attestation_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AttestationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AttestationServiceApplication.class, args);
	}

}
