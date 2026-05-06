package com.innovx.gestionrh.Config;

import org.apache.tika.Tika;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableJpaAuditing
@EnableAsync
public class AppConfig {

    /**
     * Apache Tika instance for extracting plain text from uploaded CV files
     * (PDF, DOCX). The extracted text is stored for PostgreSQL ILIKE search,
     * replacing the removed Elasticsearch dependency.
     */
    @Bean
    public Tika tika() {
        return new Tika();
    }
}
