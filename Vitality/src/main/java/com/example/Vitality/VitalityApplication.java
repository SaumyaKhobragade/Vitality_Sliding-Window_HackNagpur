package com.example.Vitality;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VitalityApplication {

	public static void main(String[] args) {
		SpringApplication.run(VitalityApplication.class, args);
	}

}
