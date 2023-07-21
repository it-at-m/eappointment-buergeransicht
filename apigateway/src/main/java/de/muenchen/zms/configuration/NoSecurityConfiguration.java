/*
 * Copyright (c): it@M - Dienstleister für Informations- und Telekommunikationstechnik
 * der Landeshauptstadt München, 2021
 */
package de.muenchen.zms.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;


import java.util.Arrays;


@Configuration
@Profile("no-security")
public class NoSecurityConfiguration {

    @Value("${ALLOWED_ORIGIN_1}")
    private String allowedOrigin1;

    @Value("${ALLOWED_ORIGIN_2}")
    private String allowedOrigin2;

    @Value("${ALLOWED_ORIGIN_3}")
    private String allowedOrigin3;

    @Value("${ALLOWED_ORIGIN_4}")
    private String allowedOrigin4;

    @Value("${ALLOWED_ORIGIN_5}")
    private String allowedOrigin5;

    @Value("${ALLOWED_ORIGIN_6}")
    private String allowedOrigin6;



    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:8082",
                "http://" + allowedOrigin1,
                "https://" + allowedOrigin2,
                "https://" + allowedOrigin3,
                "https://" + allowedOrigin4,
                "https://" + allowedOrigin5,
                "https://" + allowedOrigin6));
        configuration.setAllowedMethods(Arrays.asList("HEAD", "GET", "POST", "PUT", "DELETE", "PATCH"));
        // setAllowCredentials(true) is important, otherwise:
        // The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
        configuration.setAllowCredentials(true);
        // setAllowedHeaders is important! Without it, OPTIONS preflight request
        // will fail with 403 Invalid CORS request
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        // @formatter:off
        return http
                .authorizeExchange()
                .anyExchange().permitAll()
                .and()
                .cors().configurationSource(corsConfigurationSource())
                .and()
                .csrf().disable()
                .build();
        // @formatter:on
    }




}
