package com.example.tms.controller;

import java.util.List;
import java.util.Map;

import com.example.tms.model.TestCase;
import com.example.tms.model.SuggestionResponse;
import com.example.tms.dto.AiTestCaseSuggestion;
import com.example.tms.service.TestCaseService;
import com.example.tms.service.AiSuggestionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/testcases")
@CrossOrigin
public class TestCaseController {

    private final TestCaseService service;
    private final AiSuggestionService aiSuggestionService;

    public TestCaseController(TestCaseService service,
                              AiSuggestionService aiSuggestionService) {
        this.service = service;
        this.aiSuggestionService = aiSuggestionService;
    }

    @PostMapping
    public TestCase create(@RequestBody TestCase testCase) {
        return service.create(testCase);
    }

    @PutMapping("/{id}")
    public TestCase update(@PathVariable Long id,
                           @RequestBody TestCase testCase) {
        return service.update(id, testCase);
    }

    @GetMapping
    public List<TestCase> getAllTestCases() {
        return service.getAll();
    }

    @DeleteMapping("/{id}")
    public void deleteTestCase(@PathVariable Long id) {
        service.delete(id);
    }

    @PostMapping("/suggest")
    public SuggestionResponse suggest(@RequestBody Map<String, String> body) {
        String description = body.get("description");
        return service.suggestFromDescription(description);
    }

   @PostMapping("/ai-generate")
public ResponseEntity<AiTestCaseSuggestion> generate(
        @RequestBody Map<String, String> request) throws Exception {

    String summary = request.get("summary");
    System.out.println("SUMMARY RECEIVED: " + summary);
    AiTestCaseSuggestion suggestion =
            aiSuggestionService.generateFromAI(summary);

    return ResponseEntity.ok(suggestion);
}

}




