package de.muenchen.zms.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.*;

import static org.springframework.web.reactive.function.server.RequestPredicates.GET;
import static org.springframework.web.reactive.function.server.RouterFunctions.resources;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Configuration
@Slf4j
public class GuiConfiguration {

    @Bean
    public RouterFunction<ServerResponse> indexRouter(@Value("classpath:/static/index.html") final Resource indexHtml) {
        log.debug("Location of gui entry point: {}", indexHtml);

        // Serve index.html at /buergeransicht
        RouterFunction<ServerResponse> indexRoute = route(GET("/buergeransicht"),
                request -> ok().contentType(MediaType.TEXT_HTML).bodyValue(indexHtml));

        // Serve static files from /buergeransicht/**
        RouterFunction<ServerResponse> staticResourceRoute = resources("/buergeransicht/**",
                new ClassPathResource("static/"));

        // Combine the routes
        return indexRoute.and(staticResourceRoute);
    }

}
