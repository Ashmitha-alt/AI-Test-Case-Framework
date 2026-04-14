package com.example.tms.service;

import com.example.tms.dto.AiTestCaseSuggestion;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import java.util.List;
import java.util.ArrayList;

@Service
public class AiSuggestionService {

    private final OllamaService ollamaService;
    private final ObjectMapper objectMapper;

    public AiSuggestionService(OllamaService ollamaService,
                               ObjectMapper objectMapper) {
        this.ollamaService = ollamaService;
        this.objectMapper = objectMapper;
    }

   public AiTestCaseSuggestion generateFromAI(String summary) throws Exception {

    String rawJson = ollamaService.generateTestCaseJson(summary);

    rawJson = rawJson.replace("```json", "")
                     .replace("```", "")
                     .trim();

    JsonNode root = objectMapper.readTree(rawJson);

List<String> cleanedSteps = new ArrayList<>();

JsonNode stepsNode = root.get("suggestedSteps");

if (stepsNode != null) {

    if (stepsNode.isArray()) {

        for (JsonNode step : stepsNode) {

            if (step.isTextual()) {
                cleanedSteps.add(step.asText());
            }
            else if (step.isObject() && step.has("stepName")) {
                cleanedSteps.add(step.get("stepName").asText());
            }
            else {
                cleanedSteps.add(step.asText());
            }
        }
    }
    else if (stepsNode.isTextual()) {
        cleanedSteps.add(stepsNode.asText());
    }
}

ArrayNode arrayNode = objectMapper.createArrayNode();

for (String step : cleanedSteps) {
    arrayNode.add(step);
}

((ObjectNode) root).set("suggestedSteps", arrayNode);

return objectMapper.treeToValue(root, AiTestCaseSuggestion.class);
}
}