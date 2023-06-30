/*
 * Copyright (c): it@M - Dienstleister für Informations- und Telekommunikationstechnik
 * der Landeshauptstadt München, 2021
 */
package de.muenchen.zms.configuration;

import de.muenchen.zms.util.GatewayUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;


import java.util.Arrays;


@Configuration
@Profile("!no-security")
public class SecurityConfiguration {

    private static final String LOGOUT_URL = "/logout";

    private static final String LOGOUT_SUCCESS_URL = "/loggedout.html";

    @Value("${spring.session.timeout:36000}")
    private long springSessionTimeoutSeconds;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8081"));
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
        http.logout().logoutSuccessHandler(GatewayUtils.createLogoutSuccessHandler(LOGOUT_SUCCESS_URL))
                .logoutUrl(LOGOUT_URL)
                .requiresLogout(ServerWebExchangeMatchers.pathMatchers(HttpMethod.POST, LOGOUT_URL)).and()
                .authorizeExchange()
                // permitAll
                .pathMatchers(HttpMethod.OPTIONS, "/swagger-ui/**").permitAll()
                .pathMatchers(HttpMethod.OPTIONS, "/api/**").permitAll().pathMatchers(LOGOUT_SUCCESS_URL).permitAll()
                .pathMatchers("/api/*/info", "/actuator/health", "/actuator/info", "/actuator/metrics").permitAll()
                .pathMatchers("/").permitAll() // Allow unauthenticated access to root path
                // all requests
                .anyExchange().permitAll().and()
                /**
                 * The necessary subscription for csrf token attachment to {@link ServerHttpResponse}
                 * is done in class {@link CsrfTokenAppendingHelperFilter}.
                 */
                .csrf().disable()
                .cors().configurationSource(corsConfigurationSource()); // Use the new CorsConfigurationSource
        return http.build();
    }

}
