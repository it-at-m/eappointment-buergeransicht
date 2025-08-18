package de.muenchen.zms.configuration;

// Static imports should be grouped at the top
import static org.springframework.web.reactive.function.server.RequestPredicates.GET;
import static org.springframework.web.reactive.function.server.RouterFunctions.resources;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;

@Configuration
@Slf4j
public class GuiConfiguration {

    @Bean
    public RouterFunction<ServerResponse> indexRouter(@Value("classpath:/static/index.html") final Resource indexHtml) {
        log.debug("Location of gui entry point: {}", indexHtml);

        // Serve index.html at /buergeransicht1
        RouterFunction<ServerResponse> indexRoute = route(GET("/buergeransicht1"),
                request -> ok().contentType(MediaType.TEXT_HTML).bodyValue(indexHtml));

        // Serve index.html at /buergeransicht1/
        RouterFunction<ServerResponse> indexRouteWithSlash = route(GET("/buergeransicht1/"),
                request -> ok().contentType(MediaType.TEXT_HTML).bodyValue(indexHtml));

        // Serve static files from /buergeransicht1/**
        RouterFunction<ServerResponse> staticResourceRoute = resources("/buergeransicht1/**",
                new ClassPathResource("static/"));

        // Combine the routes
        return indexRoute
                .and(indexRouteWithSlash)
                .and(staticResourceRoute);
    }

}