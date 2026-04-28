package com.innovx.gestionrh.Service;

import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.xcontent.XContentType;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.springframework.stereotype.Service;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class ElasticsearchService {

    private static final Logger logger = LogManager.getLogger(ElasticsearchService.class);
    private final RestHighLevelClient client;

    public ElasticsearchService(RestHighLevelClient client) {
        this.client = client;
    }

    public void indexDocument(String filename, String content) {
        int retryCount = 0;
        while (retryCount < 3) {
            try {
                IndexRequest request = new IndexRequest("cvindex");
                request.id(filename);
                request.source(content, XContentType.JSON);
                IndexResponse response = client.index(request, RequestOptions.DEFAULT);
                logger.info("Document indexed successfully: " + response.getId());
                return;
            } catch (IOException e) {
                logger.error("Failed to index document, attempt " + (retryCount + 1), e);
                retryCount++;
                try {
                    TimeUnit.SECONDS.sleep(2);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        logger.error("Failed to index document after 3 attempts");
    }

    public List<String> searchForKeyword(String keyword) {
        try {
            SearchRequest searchRequest = new SearchRequest("cvindex");
            SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
            searchSourceBuilder.query(QueryBuilders.matchQuery("content", keyword));
            searchRequest.source(searchSourceBuilder);

            SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);
            SearchHits hits = searchResponse.getHits();
            List<String> filenames = new ArrayList<>();
            for (SearchHit hit : hits) {
                filenames.add(hit.getId());
            }
            if (filenames.isEmpty()) {
                logger.info("No documents found for keyword: " + keyword);
            }
            return filenames;
        } catch (IOException e) {
            logger.error("Search failed", e);
            return new ArrayList<>();
        }
    }
}
