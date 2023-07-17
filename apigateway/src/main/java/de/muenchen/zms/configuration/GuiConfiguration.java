package de.muenchen.zms.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;

import java.net.URI;

import static org.springframework.web.reactive.function.server.RequestPredicates.GET;
import static org.springframework.web.reactive.function.server.RouterFunctions.resources;

@Configuration
@Slf4j
public class GuiConfiguration {

    @Bean
    public RouterFunction<ServerResponse> indexRouter(@Value("classpath:/static/index.html") final Resource indexHtml) {
        log.debug("Location of gui entry point: {}", indexHtml);

        RequestPredicate indexPredicate = GET("/buergeransicht");
        HandlerFunction<ServerResponse> indexHandler = request ->
                ServerResponse.ok().contentType(MediaType.TEXT_HTML).bodyValue(indexHtml);

        // Serve index.html at /buergeransicht
        RouterFunction<ServerResponse> indexRoute = RouterFunctions.route(indexPredicate, indexHandler);

        // Serve index.html also at /buergeransicht/
        RequestPredicate indexPredicateRoot = GET("/buergeransicht/");
        RouterFunction<ServerResponse> indexRouteRoot = RouterFunctions.route(indexPredicateRoot, indexHandler);

        // Serve static files from /buergeransicht/**
        RouterFunction<ServerResponse> staticResourceRoute = resources("/buergeransicht/**",
                new ClassPathResource("static/"));

        // Combine the routes
        return RouterFunctions.nest(indexPredicate, indexRoute)
                .andRoute(indexPredicateRoot, indexHandler)
                .and(staticResourceRoute);
    }






}
