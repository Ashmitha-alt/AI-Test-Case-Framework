package com.example.tms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class OllamaService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public OllamaService() {
        this.webClient = WebClient.builder()
                .baseUrl("http://localhost:11434")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String generateTestCaseJson(String summary) {

        String prompt = """
        You are a backend API that MUST return ONLY valid JSON.

        Return EXACTLY this structure:

        {
        "suggestedTitle": "",
        "suggestedPriority": "High | Medium | Low",
        "suggestedTestType": "Functional | Negative",
        "suggestedSteps": ["Step 1", "Step 2"],
        "suggestedExpectedResult": "",
        "confidence": 0.0
        }

        STRICT RULES:
        - suggestedSteps MUST be an array of plain text strings.
        - Do NOT return objects inside suggestedSteps.
        - Do NOT return stepName, action, selector, or any nested fields.
        - Each step must be a simple sentence string.
        - Do NOT include explanations.
        - Do NOT include markdown.
        - Output must start with { and end with }.

        Based on this summary:
        "%s"
        """.formatted(summary);

        Map<String, Object> body = Map.of(
                "model", "llama3",
                "prompt", prompt,
                "stream", false
        );

        Map<String, Object> response = webClient.post()
                .uri("/api/generate")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null || response.get("response") == null) {
            throw new RuntimeException("Invalid response from Ollama");
        }

        String aiJson = response.get("response").toString();

        // Remove markdown if model adds it
        aiJson = aiJson.replace("```json", "")
                       .replace("```", "")
                       .trim();

        // Extract only JSON portion (remove explanation text if present)
        int firstBrace = aiJson.indexOf("{");
        int lastBrace = aiJson.lastIndexOf("}");

        if (firstBrace != -1 && lastBrace != -1) {
            aiJson = aiJson.substring(firstBrace, lastBrace + 1);
        }

        // Validate JSON before returning
        try {
            objectMapper.readTree(aiJson);
        } catch (Exception e) {
            throw new RuntimeException("AI returned invalid JSON: " + aiJson);
        }

        return aiJson;
    }
}