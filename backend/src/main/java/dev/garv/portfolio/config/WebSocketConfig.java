package dev.garv.portfolio.config;

import dev.garv.portfolio.live.LiveHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final LiveHandler handler;
    private final AppProperties props;

    public WebSocketConfig(LiveHandler handler, AppProperties props) {
        this.handler = handler;
        this.props = props;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler, "/live").setAllowedOriginPatterns(props.origins());
    }

    @Bean
    public ServletServerContainerFactoryBean containerFactory() {
        var f = new ServletServerContainerFactoryBean();
        f.setMaxTextMessageBufferSize(1024);
        f.setMaxSessionIdleTimeout(5 * 60_000L);
        return f;
    }
}
