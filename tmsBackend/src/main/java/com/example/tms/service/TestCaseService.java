package com.example.tms.service;
import java.util.List;
import com.example.tms.model.TestCase;
import com.example.tms.repository.TestCaseRepository;
import org.springframework.stereotype.Service;
import com.example.tms.model.SuggestionResponse;

@Service
public class TestCaseService {

    private final TestCaseRepository repository;

    public TestCaseService(TestCaseRepository repository) {
        this.repository = repository;
    }

    public TestCase create(TestCase testCase) {
        return repository.save(testCase);
    }

    public TestCase update(Long id, TestCase updated) {
        TestCase existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test case not found"));

        existing.setItemType(updated.getItemType());
        existing.setTitle(updated.getTitle());
        existing.setSummary(updated.getSummary());
        existing.setDescription(updated.getDescription());
        existing.setPriority(updated.getPriority());
        existing.setTestType(updated.getTestType());

        return repository.save(existing);
    }
    public List<TestCase> getAll() {
    return repository.findAll();
    }
    public void delete(Long id) {
    if (!repository.existsById(id)) {
        throw new RuntimeException("Test case not found");
    }
    repository.deleteById(id);
}
public SuggestionResponse suggestFromDescription(String description) {

    String lower = description.toLowerCase();

    String title = "General test case";
    String priority = "Medium";
    String type = "Functional";

    if (lower.contains("login")) {
        title = "Login validation scenario";
    }

    if (lower.contains("invalid") || lower.contains("wrong") || lower.contains("fail")) {
        type = "Negative";
    }

    if (lower.contains("crash") || lower.contains("error") || lower.contains("data loss")) {
        priority = "High";
    }

    if (lower.contains("slow") || lower.contains("performance")) {
        priority = "Medium";
        title = "Performance test scenario";
    }

    return new SuggestionResponse(title, priority, type);
}
}

